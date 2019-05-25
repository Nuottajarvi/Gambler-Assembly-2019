#include <string>
#include <iostream>
#include <vector>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <GLFW/linmath.h>
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

static int texIndex = 0;

GLint loadTexture(std::string fileName, std::string shaderName, GLuint program) {

	int width, height, nrChannels;
	unsigned char *data = stbi_load(fileName.c_str(), &width, &height, &nrChannels, 0);

	GLint tex;
	if (data)
	{
		tex = glGetUniformLocation(program, shaderName.c_str());
		glActiveTexture(GL_TEXTURE0 + texIndex);
		glBindTexture(GL_TEXTURE_2D, tex);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST); //set its parameters
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
		glGenerateMipmap(GL_TEXTURE_2D);

		texIndex++;
	}
	else
	{
		std::cout << "Failed to load texture" << std::endl;
	}
	stbi_image_free(data);

	return tex;
}

void resetTextures() {
	texIndex = 0;
}