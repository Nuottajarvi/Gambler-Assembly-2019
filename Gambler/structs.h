#pragma once

#define VertexArray std::vector<Vertex>
#define IndiceArray std::vector<unsigned int>

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

const struct Scene
{
	VertexArray vertices;
	IndiceArray indices;
	std::string vertexShader;
	std::string fragmentShader;
};