#include <vector>
#include "shaderReader.h"
#include "structs.h"
#include <iostream>

Scene scene1() {

	shaderReader vertexShader = shaderReader("scene1.vert");
	shaderReader fragmentShader = shaderReader("scene1.frag");

	shaderReader post_vert = shaderReader("post.vert");
	shaderReader post_frag = shaderReader("antialias-post.frag");

	VertexArray vertices{
		{ -1.f, -1.f, 0.f,		 0.f,  1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{ -1.f,  1.f, 0.f,		 0.f,  0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  1.f,  1.f, 0.f,		 1.8f, 0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  1.f, -1.f, 0.f,		 1.8f, 1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  }
	};

	IndiceArray indices{ 0, 1, 2, 2, 3, 0 };

	return { 39., vertices, indices, vertexShader.source, fragmentShader.source, 0, post_vert.source, post_frag.source, 2 };
}