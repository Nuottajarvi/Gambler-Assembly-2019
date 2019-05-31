#include <glad/glad.h>
#include <vector>
#include <iostream>
#include "shaderReader.h"
#include "structs.h"
#include "objReader.h"
#include "textureLoader.h"

unsigned int fbo;

Scene scene4() {
	VertexArray vertices;
	IndiceArray indices;
	shaderReader vertexShader = shaderReader("scene4.vert");
	shaderReader fragmentShader = shaderReader("scene4.frag");

	objReader("revolver.obj", vertices, indices);

	return { vertices, indices, vertexShader.source, fragmentShader.source, 0 };
}

void onEnd() {
	//glDeleteFramebuffers(1, &fbo);
}