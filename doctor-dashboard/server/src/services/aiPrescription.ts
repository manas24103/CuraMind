import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIPrescriptionService {
  async generatePrescription(symptoms: string, medicalHistory: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant that generates prescriptions based on symptoms and medical history."
          },
          {
            role: "user",
            content: `Patient symptoms: ${symptoms}
            Medical history: ${medicalHistory}
            Generate a prescription with appropriate medicines, dosages, and duration.`
          }
        ]
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating prescription:', error);
      throw error;
    }
  }

  async validatePrescription(prescription: string): Promise<boolean> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical prescription validator."
          },
          {
            role: "user",
            content: `Validate this prescription for safety and appropriateness:
            ${prescription}`
          }
        ]
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("AI did not return a valid response.");
      }

      return response.toLowerCase().includes('valid') || response.toLowerCase().includes('safe');

    } catch (error) {
      console.error('Error validating prescription:', error);
      throw error;
    }
  }
}
