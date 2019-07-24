#include <vector>
#include "shaderReader.h"
#include "structs.h"
#include <iostream>
#include "textureLoader.h"

TextureArray getTextures7(GLuint program) {
	TextureArray textures;
	textures.push_back(loadTexture("dirtyglass.png", "glassTex", program));
	return textures;
}

Scene scene7() {

	shaderReader vertexShader = shaderReader("scene7.vert");
	shaderReader fragmentShader = shaderReader("scene7.frag");

	shaderReader post_vert = shaderReader("post.vert");
	shaderReader post_frag = shaderReader("antialias-post.frag");

	VertexArray vertices{
		{ -1.f, -1.f, 0.f,		 0.f,  1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{ -1.f,  1.f, 0.f,		 0.f,  0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  1.f,  1.f, 0.f,		 1.8f, 0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  1.f, -1.f, 0.f,		 1.8f, 1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  }
	};

	IndiceArray indices{ 0, 1, 2, 2, 3, 0 };

	return { 300., vertices, indices, vertexShader.source, fragmentShader.source, getTextures7, post_vert.source, post_frag.source, 6 };
}