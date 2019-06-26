#include <vector>
#include "shaderReader.h"
#include "structs.h"
#include <iostream>

void createBg(VertexArray &vertices, IndiceArray &indices) {
	static VertexArray bgVertices = {
		{ -27.f, -15.f, -25.f,		 0.f,  0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{ -27.f,  15.f, -25.f,		 0.f,  1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  27.f,  15.f, -25.f,		 1.8f, 1.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  },
		{  27.f, -15.f, -25.f,		 1.8f, 0.f,		0.f, 0.f, 0.f,		0.f, 0.f, 0.f  }
	};
	vertices.insert(vertices.end(), bgVertices.begin(), bgVertices.end());

	static IndiceArray bgIndices = { 0,1,2,2,3,0 };
	indices.insert(indices.end(), bgIndices.begin(), bgIndices.end());
}

void createChip(Vec3 pos, VertexArray &vertices, IndiceArray &indices)
{
	const float w = 0.5f; //width
	const float t = 0.1f / 2.0f; //thickness

	int a = static_cast<int>(vertices.size()); //start offset for indices

	vertices.push_back({ 0.f, 0.f, -t,		0.f, 0.f,	 pos.x, pos.y, pos.z,	0.f, 0.f, 0.f });
	vertices.push_back({ 0.f, 0.f,  t,		0.f, 0.f,	 pos.x, pos.y, pos.z,	0.f, 0.f, 0.f });

	int corners = 30;
	for (int i = 0; i < corners; i++) {
		float angle = i * (2 * 3.14159f) / corners;
		vertices.push_back({
			static_cast<float>(cos(angle)) * w,
			static_cast<float>(sin(angle)) * w,
			-t,
			static_cast<float>(cos(angle)),
			static_cast<float>(sin(angle)),
			pos.x, pos.y, pos.z
			});

		vertices.push_back({
			static_cast<float>(cos(angle)) * w,
			static_cast<float>(sin(angle)) * w,
			t,
			static_cast<float>(cos(angle)),
			static_cast<float>(sin(angle)),
			pos.x, pos.y, pos.z
			});
	}

	int indiceCount = 2;

	for (int i = 0; i < corners - 1; i++) {
		//bottom
		indices.push_back(a);
		indices.push_back(a + indiceCount);
		indices.push_back(a + indiceCount + 2);

		//top
		indices.push_back(a + 1);
		indices.push_back(a + indiceCount + 3);
		indices.push_back(a + indiceCount + 1);

		//side 1
		indices.push_back(a + indiceCount);
		indices.push_back(a + indiceCount + 1);
		indices.push_back(a + indiceCount + 2);

		//side 2
		indices.push_back(a + indiceCount + 1);
		indices.push_back(a + indiceCount + 3);
		indices.push_back(a + indiceCount + 2);

		indiceCount += 2;
	}

	indices.push_back(a + 0);
	indices.push_back(a + indiceCount); // 6
	indices.push_back(a + 2);

	indices.push_back(a + 1);
	indices.push_back(a + 3);
	indices.push_back(a + indiceCount + 1); // 7

	indices.push_back(a + indiceCount);
	indices.push_back(a + indiceCount + 1);
	indices.push_back(a + 3);

	indices.push_back(a + 3);
	indices.push_back(a + 2);
	indices.push_back(a + indiceCount);
}

Scene scene2() {
	VertexArray vertices;
	IndiceArray indices;
	shaderReader vertexShader = shaderReader("scene2.vert");
	shaderReader fragmentShader = shaderReader("scene2.frag");

	shaderReader post_vert = shaderReader("post.vert");
	shaderReader post_frag = shaderReader("antialias-post.frag");

	createBg(vertices, indices);

	for (int i = 0; i < 250; i++) {
		float rx = ((float)rand() / (RAND_MAX));
		float ry = ((float)rand() / (RAND_MAX));
		float rz = ((float)rand() / (RAND_MAX));

		createChip({ -10.f + rx * 20.f, -8.f + ry * 16.f, -rz * 30.f - 17.f }, vertices, indices);
	}

	return {13., vertices, indices, vertexShader.source, fragmentShader.source, 0 ,post_vert.source, post_frag.source, 2 };
}