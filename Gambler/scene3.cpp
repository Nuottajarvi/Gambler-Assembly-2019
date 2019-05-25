#include <vector>
#include <iostream>
#include "shaderReader.h"
#include "structs.h"
#include "objReader.h"
#include "textureLoader.h"
#include <GLFW/glfw3.h>

void flipIndices(unsigned int &j) {
	if (j % 3 == 1) {
		j = j + 1;
	}
	else if (j % 3 == 2) {
		j = j - 1;
	}
}

TextureArray getTextures(GLuint program) {
	TextureArray textures;
	textures.push_back(loadTexture("sofa.png", "sofaTex", program));
	textures.push_back(loadTexture("insidetrain.png", "roomTex", program));

	return textures;
}

Scene scene3() {
	VertexArray vertices;
	IndiceArray indices;

	VertexArray itVertices;
	IndiceArray itIndices;
	shaderReader vertexShader = shaderReader("scene3.vert");
	shaderReader fragmentShader = shaderReader("scene3.frag");

	objReader("insidetrain.obj", itVertices, itIndices);

	for (int n = 0; n < 8; n++) {
		for (int i = 0; i < 4; i++) {
			for (int j = 0; j < itVertices.size(); j++) {
				Vertex copy = itVertices.at(j);

				if (i % 2 == 1) {
					copy.x = -copy.x;
					flipIndices(itIndices.at(j));
				}
				if (i >= 2) {
					copy.z = -copy.z;
				}

				copy.z += -8.f + n * 2.8f;

				vertices.push_back(copy);
				indices.push_back(itIndices.at(j) + itIndices.size() * (i + n * 4));
			}
		}
	}

	return { vertices, indices, vertexShader.source, fragmentShader.source, getTextures };
}