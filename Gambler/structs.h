#pragma once

#include <GLFW/glfw3.h>
#include <vector>

#define VertexArray std::vector<Vertex>
#define IndiceArray std::vector<unsigned int>
#define TextureArray std::vector<GLint>

const struct Vec2
{
	float x, y;
};

const struct Vec3
{
	float x, y, z;
};

const struct Vertex
{
	float x, y, z; //local coordinates
	float s, t; //texture coordinates
	float wx, wy, wz; //world object coordinates
	float nx, ny, nz; //normals
};

const struct Scene
{
	float length;
	VertexArray vertices;
	IndiceArray indices;
	std::string vertexShader;
	std::string fragmentShader;
	TextureArray (*getTextures)(GLuint);
	std::string postVertexShader;
	std::string postFragmentShader;
	int postRuns;
};