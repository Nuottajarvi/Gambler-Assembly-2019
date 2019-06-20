#include <string>
#include <fstream>
#include <iostream>
#include <vector>
#include "structs.h"
#include "objReader.h"

void objReader(std::string name, VertexArray &vertices, IndiceArray &indices) {
	objReader(name, vertices, indices, { 0, 0, 0 });
}

void objReader(std::string name, VertexArray &vertices, IndiceArray &indices, Vec3 worldPos) {
	
	FILE * file = fopen(name.c_str(), "r");
	if (file == NULL) {
		printf("Impossible to open the file !\n");
		return;
	}

	std::vector<Vec3> temp_vertices;
	std::vector<Vec2> temp_uvs;
	std::vector<Vec3> temp_normals;

	while (true) {

		char lineHeader[128];
		// read the first word of the line
		int res = fscanf(file, "%s", lineHeader);
		if (res == EOF)
			break; // EOF = End Of File. Quit the loop.

		if (strcmp(lineHeader, "v") == 0) {
			Vec3 vertex;
			fscanf(file, "%f %f %f\n", &vertex.x, &vertex.y, &vertex.z);
			temp_vertices.push_back(vertex);
		}
		else if (strcmp(lineHeader, "vt") == 0) {
			Vec2 uv;
			fscanf(file, "%f %f\n", &uv.x, &uv.y);
			temp_uvs.push_back(uv);
		}
		else if (strcmp(lineHeader, "vn") == 0) {
			Vec3 normal;
			fscanf(file, "%f %f %f\n", &normal.x, &normal.y, &normal.z);
			temp_normals.push_back(normal);
		}
		else if (strcmp(lineHeader, "f") == 0) {
			unsigned int vertexIndex[3], uvIndex[3], normalIndex[3];
			int matches = fscanf(file, "%d/%d/%d %d/%d/%d %d/%d/%d\n", &vertexIndex[0], &uvIndex[0], &normalIndex[0], &vertexIndex[1], &uvIndex[1], &normalIndex[1], &vertexIndex[2], &uvIndex[2], &normalIndex[2]);
			if (matches != 9) {
				printf("File can't be read by our simple parser : ( Try exporting with other options\n");
				return;
			}

			int startIndice = vertices.size();

			for (int i = 0; i < 3; i++) {
				Vec3 v = temp_vertices.at(vertexIndex[i] - 1);
				Vec2 uv = temp_uvs.at(uvIndex[i] - 1);
				Vec3 n = temp_normals.at(normalIndex[i] - 1);
				vertices.push_back({
					v.x, v.y, v.z,
					uv.x, 1.f -  uv.y,
					worldPos.x, worldPos.y, worldPos.z,
					n.x, n.y, n.z
				});
			}

			indices.push_back(startIndice);
			indices.push_back(startIndice + 1);
			indices.push_back(startIndice + 2);
		}
	}

	fclose(file);
}