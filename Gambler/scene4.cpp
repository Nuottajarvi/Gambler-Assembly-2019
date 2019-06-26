#include <glad/glad.h>
#include <vector>
#include <iostream>
#include "shaderReader.h"
#include "structs.h"
#include "objReader.h"
#include "textureLoader.h"
#include "scene2.h"

unsigned int fbo;

Scene scene4() {
	VertexArray vertices;
	IndiceArray indices;
	shaderReader vertexShader = shaderReader("scene4.vert");
	shaderReader fragmentShader = shaderReader("scene4.frag");

	shaderReader post_vert = shaderReader("post.vert");
	shaderReader post_frag = shaderReader("scene4-post.frag");
	
	createBg(vertices, indices);
	objReader("revolver.obj", vertices, indices, { 1, 0, 0 });

	return { 26. , vertices, indices, vertexShader.source, fragmentShader.source, 0, post_vert.source, post_frag.source, 6 };
}

void onEnd() {
	//glDeleteFramebuffers(1, &fbo);
}