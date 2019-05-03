#include <vector>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <GLFW/linmath.h>
#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <iostream>
#include "shaderReader.h"

const struct Vec3
{
	float x, y, z;
};

const struct Vertex
{
	float x, y, z; //local coordinates
	float s, t; //texture coordinates
	float wx, wy, wz; //world object coordinates
};

static std::vector<Vertex> vertices;

static std::vector<unsigned int> indices;

shaderReader vertexShader = shaderReader("scene2.vert");
shaderReader fragmentShader = shaderReader("scene2.frag");

static const char* vertex_shader_text = vertexShader.source.c_str();
static const char* fragment_shader_text = fragmentShader.source.c_str();

static void error_callback(int error, const char* description)
{
	fprintf(stderr, "Error: %s\n", description);
}

static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
	if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
		glfwSetWindowShouldClose(window, GLFW_TRUE);
}

void createChip(Vec3 pos)
{
	const float w = 0.5f; //width
	const float t = 0.1f / 2.0f; //thickness

	int a = vertices.size(); //start offset for indices

	vertices.push_back({ 0.f, 0.f, -t,		0.f, 0.f,	 pos.x, pos.y, pos.z });
	vertices.push_back({ 0.f, 0.f,  t,		0.f, 0.f,	 pos.x, pos.y, pos.z });

	int corners = 30;
	for (int i = 0; i < corners; i++) {
		float angle = i * (2 * 3.14159) / corners;
		vertices.push_back({
			static_cast<float>(cos(angle)) * w, 
			static_cast<float>(sin(angle)) * w,
			-t,
			static_cast<float>(cos(angle)),
			static_cast<float>(sin(angle)),
			pos.x, pos.y, pos.z
		});

		vertices.push_back({
			static_cast<float>(cos(angle)) * w,
			static_cast<float>(sin(angle)) * w,
			t,
			static_cast<float>(cos(angle)),
			static_cast<float>(sin(angle)),
			pos.x, pos.y, pos.z
		});
	}

	int indiceCount = 2;

	for (int i = 0; i < corners - 1; i++) {
		//bottom
		indices.push_back(a);
		indices.push_back(a + indiceCount);
		indices.push_back(a + indiceCount + 2);

		//top
		indices.push_back(a + 1);
		indices.push_back(a + indiceCount + 3);
		indices.push_back(a + indiceCount + 1);

		//side 1
		indices.push_back(a + indiceCount);
		indices.push_back(a + indiceCount + 1);
		indices.push_back(a + indiceCount + 2);

		//side 2
		indices.push_back(a + indiceCount + 1);
		indices.push_back(a + indiceCount + 3);
		indices.push_back(a + indiceCount + 2);

		indiceCount+=2;
	}

	indices.push_back(a + 0);
	indices.push_back(a + indiceCount); // 6
	indices.push_back(a + 2);

	indices.push_back(a + 1);
	indices.push_back(a + 3);
	indices.push_back(a + indiceCount + 1); // 7

	indices.push_back(a + indiceCount);
	indices.push_back(a + indiceCount + 1);
	indices.push_back(a + 3);

	indices.push_back(a + 3);
	indices.push_back(a + 2);
	indices.push_back(a + indiceCount);
}

int main(void)
{
	for (int i = 0; i < 250; i++) {
		float rx = ((float)rand() / (RAND_MAX));
		float ry = ((float)rand() / (RAND_MAX));
		float rz = ((float)rand() / (RAND_MAX));

		std::cout << rx << " " << ry << " " << rz << std::endl;

		createChip({ -10.f + rx * 20.f, -8.f + ry * 16.f, -rz * 30.f - 2.f});
	}

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

	//Vertices
	glGenBuffers(1, &vertex_buffer);
	glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer);
	glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex), &vertices[0], GL_STATIC_DRAW);

	//Indices
	glGenBuffers(1, &element_buffer);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, element_buffer);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(unsigned int), &indices[0], GL_STATIC_DRAW);


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
		sizeof(vertices[0]), (void*)0);
	glEnableVertexAttribArray(vtex_location);
	glVertexAttribPointer(vtex_location, 2, GL_FLOAT, GL_FALSE,
		sizeof(vertices[0]), (void*)(sizeof(float) * 3));
	glEnableVertexAttribArray(vworldpos_location);
	glVertexAttribPointer(vworldpos_location, 3, GL_FLOAT, GL_FALSE,
		sizeof(vertices[0]), (void*)(sizeof(float) * 5));

	glUniform1f(itime_location, glfwGetTime());

	GLint isLinked = 0;
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

		glDrawElements(GL_TRIANGLES, indices.size(), GL_UNSIGNED_INT, (void*)0);
		glfwSwapBuffers(window);
		glfwPollEvents();
	}
	glfwDestroyWindow(window);
	glfwTerminate();
	exit(EXIT_SUCCESS);
}