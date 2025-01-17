#include <vector>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <GLFW/linmath.h>
#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <iostream>
#include <string>
#include <mmsystem.h>
#include "structs.h"
#include "shaderReader.h"
#include "scene1.h"
#include "scene2.h"
#include "scene3.h"
#include "scene4.h"
#include "scene5.h"
#include "scene6.h"
#include "scene7.h"
#include "textureLoader.h"

const float screen_width = 640 * 2;//1920;
const float screen_height = 360 * 2;//1080;

const float test_screen_width = 640 * 2;
const float test_screen_height = 360 * 2;

const float songStartDelay = 0.5;

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
	//Synth::play();

	GLFWwindow* window;
	glfwSetErrorCallback(error_callback);
	if (!glfwInit())
		exit(EXIT_FAILURE);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
	window = glfwCreateWindow(screen_width, screen_height, "Gambler", NULL/*glfwGetPrimaryMonitor()*/, NULL);

	//test screen
	//window = glfwCreateWindow(test_screen_width, test_screen_height, "Gambler", NULL, NULL);
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

	//transparency
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

	int sceneId = 0;

	Scene(*scenes[])() = {/*scene1, scene2, scene3, scene4, scene5, scene6,*/ scene7};


	GLuint vertex_buffer, element_buffer, vertex_shader, fragment_shader,
		post_fragment_shader, post_vertex_shader, program, post_program;


	ShowCursor(0);
	PlaySound("./music.wav", NULL, SND_ASYNC);
	while (!glfwWindowShouldClose(window) && sceneId < sizeof(scenes) / sizeof(*(scenes))) {
		GLint mvp_location, vpos_location, vworldpos_location, vtex_location, vnor_location, itime_location;

		Scene scene = scenes[sceneId]();
		sceneId++;

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
		vnor_location = glGetAttribLocation(program, "vNor");

		itime_location = glGetUniformLocation(program, "iTime");

		TextureArray textures;
		if (scene.getTextures != 0)
			textures = scene.getTextures(program);

		//TEXTURE STUFF
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);
		float borderColor[] = { 1.0f, 1.0f, 0.0f, 1.0f }; //for GL_CLAMP_TO_BORDER
		glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);

		std::vector<GLint> tex_obj;

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


		//POST PROCESSING
		GLuint textureColorbuffer[2];
		GLuint framebuffer[2];

		GLuint fbo_texture_location, v_coord_location, post_itime_location, pass_location;
		GLuint vbo_fbo_vertices, vbo_fbo_indices;

		bool hasPost = scene.postFragmentShader != "";
		if (hasPost) {
			glGenFramebuffers(2, framebuffer);

			glGenTextures(2, textureColorbuffer);
			for (int i = 0; i < 2; i++) {
				glBindFramebuffer(GL_FRAMEBUFFER, framebuffer[i]);
				glBindTexture(GL_TEXTURE_2D, textureColorbuffer[i]);
				glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, screen_width, screen_height, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
				glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
				glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, textureColorbuffer[i], 0);
			}

			if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
				std::cout << "ERROR::FRAMEBUFFER:: Framebuffer is not complete!" << std::endl;
			glBindFramebuffer(GL_FRAMEBUFFER, 0);

			const char* post_vert_text = scene.postVertexShader.c_str();
			const char* post_frag_text = scene.postFragmentShader.c_str();
			glCreateShader(GL_FRAGMENT_SHADER);

			post_fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
			glShaderSource(post_fragment_shader, 1, &post_frag_text, NULL);
			glCompileShader(post_fragment_shader);

			post_vertex_shader = glCreateShader(GL_VERTEX_SHADER);
			glShaderSource(post_vertex_shader, 1, &post_vert_text, NULL);
			glCompileShader(post_vertex_shader);

			post_program = glCreateProgram();
			glAttachShader(post_program, post_vertex_shader);
			glAttachShader(post_program, post_fragment_shader);
			glLinkProgram(post_program);

			GLint validate_ok;
			GLfloat fbo_vertices[] = {
				-1,   1,
				 1,   1,
				-1,  -1,
				 1,  -1
			};

			glGenBuffers(1, &vbo_fbo_vertices);
			glBindBuffer(GL_ARRAY_BUFFER, vbo_fbo_vertices);
			glBufferData(GL_ARRAY_BUFFER, sizeof(fbo_vertices), fbo_vertices, GL_STATIC_DRAW);
			glBindBuffer(GL_ARRAY_BUFFER, 0);

			fbo_texture_location = glGetUniformLocation(post_program, "fbo_tex");
			v_coord_location = glGetAttribLocation(post_program, "v_coord");
			post_itime_location = glGetUniformLocation(post_program, "iTime");
			pass_location = glGetUniformLocation(post_program, "iPass");

			GLint postIsLinked = 0;

			//ERROR CHECKING FOR POST
			glGetProgramiv(post_program, GL_LINK_STATUS, &postIsLinked);
			if (postIsLinked == GL_FALSE)
			{
				GLint maxLength = 0;
				glGetProgramiv(post_program, GL_INFO_LOG_LENGTH, &maxLength);

				// The maxLength includes the NULL character
				std::vector<GLchar> infoLog(maxLength);
				glGetProgramInfoLog(post_program, maxLength, &maxLength, &infoLog[0]);

				// The program is useless now. So delete it.
				glDeleteProgram(post_program);

				for (auto i = infoLog.begin(); i != infoLog.end(); ++i)
					std::cout << *i << ' ';
			}
		}

		float startTime = (float)glfwGetTime();

		float lastTime = 0.;

		while (!glfwWindowShouldClose(window)) {
			float time = (float)glfwGetTime() - startTime;
			std::cout << 1.f / (time - lastTime) << std::endl;

			if (time > scene.length) {
				break;
			}

			lastTime = time;
			float ratio;
			int width, height;
			mat4x4 m, p, mvp;
			glfwGetFramebufferSize(window, &width, &height);
			ratio = width / (float)height;

			if (hasPost) {
				glBindFramebuffer(GL_FRAMEBUFFER, framebuffer[0]);
				glBindTexture(GL_TEXTURE_2D, textureColorbuffer[0]);
				glViewport(0, 0, width, height);
			}
			glClearColor(0.0, 0.0, 0.0, 1.0);
			glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
			mat4x4_identity(m);
			mat4x4_perspective(p, -1.f, 1.8f, 0.01f, 50.f);
			mat4x4_mul(mvp, p, m);
			glUseProgram(program);
			glUniformMatrix4fv(mvp_location, 1, GL_FALSE, (const GLfloat*)mvp);

			glUniform1f(itime_location, time);
			for (int i = 0; i < textures.size(); i++) {
				glBindTexture(GL_TEXTURE_2D, textures[i]);
				glUniform1i(textures[i], i);
			}

			glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer);
			glEnableVertexAttribArray(vpos_location);
			glVertexAttribPointer(vpos_location, 3, GL_FLOAT, GL_FALSE,
				sizeof(scene.vertices[0]), (void*)0);
			glEnableVertexAttribArray(vtex_location);
			glVertexAttribPointer(vtex_location, 2, GL_FLOAT, GL_FALSE,
				sizeof(scene.vertices[0]), (void*)(sizeof(float) * 3));
			glEnableVertexAttribArray(vworldpos_location);
			glVertexAttribPointer(vworldpos_location, 3, GL_FLOAT, GL_FALSE,
				sizeof(scene.vertices[0]), (void*)(sizeof(float) * 5));
			glEnableVertexAttribArray(vnor_location);
			glVertexAttribPointer(vnor_location, 3, GL_FLOAT, GL_FALSE,
				sizeof(scene.vertices[0]), (void*)(sizeof(float) * 8));

			glDrawElements(GL_TRIANGLES, scene.indices.size(), GL_UNSIGNED_INT, (void*)0);

			if (hasPost) {
				glUseProgram(post_program);

				glEnableVertexAttribArray(v_coord_location);

				glBindBuffer(GL_ARRAY_BUFFER, vbo_fbo_vertices);
				glVertexAttribPointer(
					v_coord_location,	// attribute
					2,                  // number of elements per vertex, here (x,y)
					GL_FLOAT,           // the type of each element
					GL_FALSE,           // take our values as-is
					0,                  // no extra data between each position
					0                   // offset of first element
				);

				glUniform1i(fbo_texture_location, GL_TEXTURE0);
				glUniform1f(post_itime_location, time);

				for (int i = 0; i < scene.postRuns; i++) {
					int pingpong = i % 2;
					glBindFramebuffer(GL_FRAMEBUFFER, framebuffer[(i + 1) % 2]);
					glBindTexture(GL_TEXTURE_2D, textureColorbuffer[i % 2]);
					glUniform1i(pass_location, i);
					glDrawArrays(GL_TRIANGLE_STRIP, 0, 6);
				}

				glBindFramebuffer(GL_FRAMEBUFFER, 0);
				glClearColor(0.0, 0.0, 0.0, 1.0);
				glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

				glDrawArrays(GL_TRIANGLE_STRIP, 0, 6);
			}
			glfwSwapBuffers(window);
			glfwPollEvents();
		}

		resetTextures();
		if(textures.size() > 0)
			glDeleteTextures(textures.size(), (const GLuint*) &textures[0]);

		glDeleteProgram(program);
		GLuint buffers[] = { 
			vertex_buffer, element_buffer, vertex_shader, fragment_shader, program
		};

		if (hasPost) {
			GLuint postbuffers[] = {
				post_fragment_shader, post_vertex_shader, post_program
			};
			memcpy(buffers + sizeof(buffers), postbuffers, sizeof(postbuffers));
		}
		glDeleteBuffers(sizeof(buffers) / sizeof(*(buffers)), buffers);
	}
	glfwDestroyWindow(window);
	glfwTerminate();
	exit(EXIT_SUCCESS);
}