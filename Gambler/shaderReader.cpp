#include <string>
#include <fstream>
#include <iostream>
#include "shaderReader.h"

shaderReader::shaderReader(std::string name)
{
	std::string line, allLines;
	std::ifstream theFile(name);
	if (theFile.is_open())
	{
		while (std::getline(theFile, line))
		{
			allLines = allLines + line + "\n";
		}

		source = allLines.c_str();
		theFile.close();
	}
	else
	{
		std::cout << "Unable to open file.";
	}
}