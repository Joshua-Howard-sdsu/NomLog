// src/lib/analyzeImage.ts
export async function analyzeImage(base64Image: string) {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64Image.includes('base64,') 
            ? base64Image 
            : `data:image/jpeg;base64,${base64Image}`
        }),
      });
  
      // Get the response text first
      const text = await response.text();
      
      // Try to parse it as JSON
      try {
        const data = JSON.parse(text);
        
        // If the response wasn't ok, throw the error
        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze image');
        }
        
        return data;
      } catch {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error in analyzeImage:', error);
      throw error;
    }
  }