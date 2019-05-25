#include <windows.h>
#include <mmsystem.h>
#include <stdio.h>
#include <iostream>

namespace Synth {
	LPSTR Generate_Square_Wave(
		signed short a_amplitude,
		signed short a_frequency,
		signed short a_sample_rate)
	{
		LPSTR sample = new char[a_sample_rate];

		for (signed short c = 0; c < a_sample_rate; c++)
		{
			if (c % a_frequency < a_frequency / 2)
				sample[c] = (char)(a_amplitude);
			else
				sample[c] = (char)-a_amplitude;

			std::cout << (int)sample[c] << std::endl;
		}

		return sample;
	}

	void writeAudioBlock(HWAVEOUT hWaveOut, LPSTR block, DWORD size)
	{
		WAVEHDR header;
		/*
		 * initialise the block header with the size
		 * and pointer.
		 */
		ZeroMemory(&header, sizeof(WAVEHDR));
		header.dwBufferLength = size;
		header.lpData = block;
		/*
		 * prepare the block for playback
		 */
		waveOutPrepareHeader(hWaveOut, &header, sizeof(WAVEHDR));
		/*
		 * write the block to the device. waveOutWrite returns immediately
		 * unless a synchronous driver is used (not often).
		 */
		waveOutWrite(hWaveOut, &header, sizeof(WAVEHDR));
		/*
		 * wait a while for the block to play then start trying
		 * to unprepare the header. this will fail until the block has
		 * played.
		 */
		Sleep(500);
		while (waveOutUnprepareHeader(
			hWaveOut,
			&header,
			sizeof(WAVEHDR)
		) == WAVERR_STILLPLAYING)
			Sleep(100);
	}


	void play() {
		LPSTR sample = Generate_Square_Wave(50, 440, 22050);

		HWAVEOUT hWaveOut; /* device handle */
		WAVEFORMATEX wfx; /* look this up in your documentation */
		MMRESULT result;/* for waveOut return values */

		wfx.nSamplesPerSec = 44100; /* sample rate */
		wfx.wBitsPerSample = 16; /* sample size */
		wfx.nChannels = 1; /* channels*/

		wfx.cbSize = 0; /* size of _extra_ info */
		wfx.wFormatTag = WAVE_FORMAT_PCM;
		wfx.nBlockAlign = (wfx.wBitsPerSample >> 3) * wfx.nChannels;
		wfx.nAvgBytesPerSec = wfx.nBlockAlign * wfx.nSamplesPerSec;

		if (waveOutOpen(
			&hWaveOut,
			WAVE_MAPPER,
			&wfx,
			0,
			0,
			CALLBACK_NULL
		) != MMSYSERR_NOERROR) {
			fprintf(stderr, "unable to open WAVE_MAPPER device\n");
			ExitProcess(1);
		}
		/*
		 * device is now open so print the success message
		 * and then close the device again.
		 */
		printf("The Wave Mapper device was opened successfully!\n");
		writeAudioBlock(hWaveOut, sample, sizeof(sample));
		waveOutClose(hWaveOut);
	}
}
