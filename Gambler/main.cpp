#include <vector>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <GLFW/linmath.h>
#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <iostream>
#include <string>
#include "shaderReader.h"
#include "structs.h"
#include "scene2.h"

static void error_callback(int error, const char* description)
{
	fprintf(stderr, "Error: %s\n", description);
}

static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
	if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
		glfwSetWindowShouldClose(window, GLFW_TRUE);
}

int main(void)
{
	GLFWwindow* window;
	GLuint vertex_buffer, element_buffer, vertex_shader, fragment_shader, program;
	GLint mvp_location, vpos_location, vworldpos_location, vtex_location, itime_location;
	glfwSetErrorCallback(error_callback);
	if (!glfwInit())
		exit(EXIT_FAILURE);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
	window = glfwCreateWindow(640, 360, "Gambler", NULL, NULL);
	if (!window)
	{
		glfwTerminate();
		exit(EXIT_FAILURE);
	}
	glfwSetKeyCallback(window, key_callback);
	glfwMakeContextCurrent(window);
	gladLoadGL();
	glfwSwapInterval(1);
	
	glEnable(GL_CULL_FACE);
	glCullFace(GL_FRONT);

	glEnable(GL_DEPTH_TEST);
	glDepthFunc(GL_LESS);

	Scene scene = scene2();
	std::cout << scene.fragmentShader << std::endl;

	const char* vertex_shader_text = scene.vertexShader.c_str();
	const char* fragment_shader_text = scene.fragmentShader.c_str();
	
	//vertices
	glGenBuffers(1, &vertex_buffer);
	glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer);
	glBufferData(GL_ARRAY_BUFFER, scene.vertices.size() * sizeof(Vertex), &scene.vertices[0], GL_STATIC_DRAW);

	//indices
	glGenBuffers(1, &element_buffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, element_buffer);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, scene.indices.size() * sizeof(unsigned int), &scene.indices[0], GL_STATIC_DRAW);


	vertex_shader = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vertex_shader, 1, &vertex_shader_text, NULL);
	glCompileShader(vertex_shader);
	fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(fragment_shader, 1, &fragment_shader_text, NULL);
	glCompileShader(fragment_shader);
	program = glCreateProgram();
	glAttachShader(program, vertex_shader);
	glAttachShader(program, fragment_shader);
	glLinkProgram(program);
	mvp_location = glGetUniformLocation(program, "MVP");
	vpos_location = glGetAttribLocation(program, "vPos");
	vtex_location = glGetAttribLocation(program, "vTex");
	vworldpos_location = glGetAttribLocation(program, "vWorldPos");

	itime_location = glGetUniformLocation(program, "iTime");

	glEnableVertexAttribArray(vpos_location);
	glVertexAttribPointer(vpos_location, 3, GL_FLOAT, GL_FALSE,
		sizeof(scene.vertices[0]), (void*)0);
	glEnableVertexAttribArray(vtex_location);
	glVertexAttribPointer(vtex_location, 2, GL_FLOAT, GL_FALSE,
		sizeof(scene.vertices[0]), (void*)(sizeof(float) * 3));
	glEnableVertexAttribArray(vworldpos_location);
	glVertexAttribPointer(vworldpos_location, 3, GL_FLOAT, GL_FALSE,
		sizeof(scene.vertices[0]), (void*)(sizeof(float) * 5));

	glUniform1f(itime_location, glfwGetTime());

	GLint isLinked = 0;

	//ERROR CHECKING
	glGetProgramiv(program, GL_LINK_STATUS, &isLinked);
	if (isLinked == GL_FALSE)
	{
		GLint maxLength = 0;
		glGetProgramiv(program, GL_INFO_LOG_LENGTH, &maxLength);

		// The maxLength includes the NULL character
		std::vector<GLchar> infoLog(maxLength);
		glGetProgramInfoLog(program, maxLength, &maxLength, &infoLog[0]);

		// The program is useless now. So delete it.
		glDeleteProgram(program);

		for (auto i = infoLog.begin(); i != infoLog.end(); ++i)
			std::cout << *i << ' ';
	}

	float lastTime = (float)glfwGetTime();
	while (!glfwWindowShouldClose(window))
	{
		float time = (float)glfwGetTime();
		//std::cout << 1.f / (time - lastTime) << std::endl;
		lastTime = time;
		float ratio;
		int width, height;
		mat4x4 m, p, mvp;
		glfwGetFramebufferSize(window, &width, &height);
		ratio = width / (float)height;
		glViewport(0, 0, width, height);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
		mat4x4_identity(m);
		mat4x4_perspective(p, -1.f, 1.8f, 0.01f, 50.f);
		mat4x4_mul(mvp, p, m);
		glUseProgram(program);
		glUniformMatrix4fv(mvp_location, 1, GL_FALSE, (const GLfloat*)mvp);

		glUniform1f(itime_location, time);

		glDrawElements(GL_TRIANGLES, scene.indices.size(), GL_UNSIGNED_INT, (void*)0);
		glfwSwapBuffers(window);
		glfwPollEvents();
	}
	glfwDestroyWindow(window);
	glfwTerminate();
	exit(EXIT_SUCCESS);
}