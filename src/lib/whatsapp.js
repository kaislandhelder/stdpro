import { toast } from '@/components/ui/use-toast';

const N8N_WEBHOOK_URL = 'https://wdktech.app.n8n.cloud/webhook-test/studioproteste';

export const sendWhatsAppMessage = async (phone, message) => {
  if (!phone) {
    console.error("WhatsApp Error: Phone number is missing.");
    toast({
      title: 'Erro de Envio',
      description: 'O número de telefone do cliente não foi informado.',
      variant: 'destructive',
    });
    return false;
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
     console.error("WhatsApp Error: Invalid phone number.", phone);
     toast({
      title: 'Erro de Envio',
      description: 'O número de telefone do cliente é inválido.',
      variant: 'destructive',
    });
    return false;
  }
  const fullPhone = `55${phoneDigits}`;

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST', // Corrected from GET to POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: fullPhone,
        message: message,
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      let errorData = { message: `Request failed with status ${response.status}` };
      try {
        // Try to parse error response from n8n
        const result = await response.json();
        errorData.message = result.message || JSON.stringify(result);
        console.error('n8n webhook error:', result);
      } catch (e) {
        // Fallback if response is not JSON
        const textResponse = await response.text();
        console.error('n8n webhook error (non-json):', textResponse);
        if (textResponse) errorData.message = textResponse;
      }
      
      toast({
        title: 'Erro no Webhook',
        description: errorData.message,
        variant: 'destructive',
      });
      return false;
    }
    
    // n8n might return a 200 OK with a workflow execution summary
    const result = await response.json();
    console.log("n8n response:", result);

    return true;

  } catch (error) {
    console.error('Fetch error from ' + N8N_WEBHOOK_URL + ':', error);
    toast({
      title: 'Erro de Rede',
      description: 'Não foi possível conectar ao serviço de mensagens. Verifique sua conexão e a URL do webhook.',
      variant: 'destructive',
    });
    return false;
  }
};