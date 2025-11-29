import { SILICON_FLOW_API_URL, SILICON_FLOW_MODEL } from '../constants';
import { SiliconFlowResponse } from '../types';

export const transcribeAudio = async (
  audioBlob: Blob,
  token: string
): Promise<string> => {
  if (!token) {
    throw new Error("SiliconFlow API Token is missing. Please configure it in Settings.");
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm'); // Ensure filename is present
  formData.append('model', SILICON_FLOW_MODEL);

  try {
    const response = await fetch(SILICON_FLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Type is set automatically by fetch when using FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Transcription failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data: SiliconFlowResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error("SiliconFlow Transcription Error:", error);
    throw error;
  }
};
