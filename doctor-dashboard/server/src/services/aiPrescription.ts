import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const prisma = new PrismaClient();

export class AIPrescriptionService {
  private readonly MODEL_NAME = 'gpt-4';
  private readonly SYSTEM_PROMPT = `You are an AI medical assistant that helps doctors generate and refine prescriptions. 
  Your responses should be in clear, structured markdown format.
  Always include:
  - Medicine names (generic and brand if possible)
  - Dosage (e.g., 500mg, 10ml)
  - Frequency (e.g., twice daily, every 6 hours)
  - Duration (e.g., for 7 days, until finished)
  - Special instructions (e.g., with food, before bed)
  - Any relevant warnings or contraindications`;

  async generatePrescription(
    symptoms: string, 
    medicalHistory: string,
    doctorId?: string
  ): Promise<{ content: string; aiContext: string }> {
    try {
      // Get doctor's prescription patterns if available
      let doctorPatterns = '';
      if (doctorId) {
        const patterns = await this.getDoctorPrescriptionPatterns(doctorId);
        if (patterns) {
          doctorPatterns = `\n\nDoctor's prescription patterns to consider:\n${patterns}`;
        }
      }

      const completion = await openai.chat.completions.create({
        model: this.MODEL_NAME,
        messages: [
          {
            role: "system",
            content: this.SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Generate a prescription for a patient with these symptoms:
            ${symptoms}
            
            Medical history: ${medicalHistory}
            ${doctorPatterns}
            
            Please provide a detailed prescription with clear sections.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content || '';
      
      // Store the AI context for learning from edits
      const aiContext = JSON.stringify({
        model: this.MODEL_NAME,
        messages: [
          { role: 'system', content: this.SYSTEM_PROMPT },
          { role: 'user', content: `Symptoms: ${symptoms}\nMedical History: ${medicalHistory}` },
          { role: 'assistant', content }
        ]
      });

      return { content, aiContext };
    } catch (error) {
      console.error('Error generating prescription:', error);
      throw new Error('Failed to generate prescription. Please try again.');
    }
  }

  async validatePrescription(prescription: string): Promise<{ isValid: boolean; feedback: string }> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.MODEL_NAME,
        messages: [
          {
            role: "system",
            content: `You are a medical prescription validator. Analyze the prescription and provide feedback on:
            1. Drug interactions
            2. Appropriate dosages
            3. Standard treatment guidelines
            4. Any potential issues or improvements
            
            Respond with a JSON object containing:
            - isValid: boolean
            - feedback: string (detailed feedback on the prescription)
            `
          },
          {
            role: "user",
            content: `Please validate this prescription:\n${prescription}`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("AI did not return a valid response.");
      }

      const result = JSON.parse(response);
      return {
        isValid: result.isValid === true,
        feedback: result.feedback || 'No specific feedback provided.'
      };
    } catch (error) {
      console.error('Error validating prescription:', error);
      throw new Error('Failed to validate prescription. Please review it carefully.');
    }
  }

  async learnFromEdit(
    originalContent: string,
    editedContent: string,
    doctorId: string,
    context: string
  ): Promise<void> {
    try {
      // Store the edit pattern for this doctor
      await prisma.doctorPrescriptionPattern.upsert({
        where: { doctorId },
        update: {
          patterns: {
            push: `Previous AI suggestion: ${originalContent}\nDoctor's edit: ${editedContent}`
          }
        },
        create: {
          doctorId,
          patterns: [`Previous AI suggestion: ${originalContent}\nDoctor's edit: ${editedContent}`]
        }
      });

      // Fine-tune the AI with this example (simplified example)
      await this.fineTuneWithExample(context, editedContent);
    } catch (error) {
      console.error('Error learning from edit:', error);
      // Fail silently - we don't want to block the prescription saving
    }
  }

  private async getDoctorPrescriptionPatterns(doctorId: string): Promise<string | null> {
    try {
      const patterns = await prisma.doctorPrescriptionPattern.findUnique({
        where: { doctorId },
        select: { patterns: true }
      });
      return patterns ? patterns.patterns.join('\n\n') : null;
    } catch (error) {
      console.error('Error getting doctor patterns:', error);
      return null;
    }
  }

  private async fineTuneWithExample(context: string, editedContent: string): Promise<void> {
    // In a real implementation, you would:
    // 1. Store the example in a database
    // 2. Periodically fine-tune a model with collected examples
    // 3. Update your model reference
    // This is a simplified placeholder
    console.log('Storing example for future fine-tuning:', { context, editedContent });
  }
}
