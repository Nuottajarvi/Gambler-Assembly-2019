#include <glad/glad.h>
#include <vector>
#include <iostream>
#include "shaderReader.h"
#include "structs.h"
#include "objReader.h"
#include "textureLoader.h"
#include "scene2.h"

TextureArray getTextures6(GLuint program) {
	TextureArray textures;
	textures.push_back(loadTexture("dice.png", "diceTex", program));
	return textures;
}

Scene scene6() {
	VertexArray vertices;
	IndiceArray indices;
	shaderReader vertexShader = shaderReader("scene6.vert");
	shaderReader fragmentShader = shaderReader("scene6.frag");

	shaderReader post_vert = shaderReader("post.vert");
	shaderReader post_frag = shaderReader("antialias-post.frag");

	objReader("dicebk.obj", vertices, indices, { 2, 0, 0 });
	objReader("dice.obj", vertices, indices, { 1, 0, 0 });

	objReader("dicebk.obj", vertices, indices, { 2, 1, 0 });
	objReader("dice.obj", vertices, indices, { 1, 1, 0 });

	objReader("dicebk.obj", vertices, indices, { 2, 2, 0 });
	objReader("dice.obj", vertices, indices, { 1, 2, 0 });

	return { 12. , vertices, indices, vertexShader.source, fragmentShader.source, getTextures6, post_vert.source, post_frag.source, 1 };
}