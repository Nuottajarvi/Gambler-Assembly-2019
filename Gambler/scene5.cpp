#include <vector>
#include "shaderReader.h"
#include "structs.h"
#include <iostream>

TextureArray getScene5Textures(GLuint program) {
	TextureArray textures;
	return textures;
}

Scene scene5() {

	shaderReader vertexShader = shaderReader("scene5.vert");
	shaderReader fragmentShader = shaderReader("scene5.frag");

	VertexArray vertices{
		{ -27.f, -15.f, -25.f,		 0.f,  1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{ -27.f,  15.f, -25.f,		 0.f,  0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  27.f,  15.f, -25.f,		 1.8f, 0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  27.f, -15.f, -25.f,		 1.8f, 1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  }
	};

	IndiceArray indices{ 0, 1, 2, 2, 3, 0 };

	return { vertices, indices, vertexShader.source, fragmentShader.source, getScene5Textures };
}