import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileText, MessageSquare, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const FinanceActions = ({ financials, playSound }) => {
  const [reportPeriod, setReportPeriod] = useState('dia');
  const [showPdfConfirm, setShowPdfConfirm] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const { toast } = useToast();

  const handleReportPeriodChange = (period) => {
    setReportPeriod(period);
    setShowPdfConfirm(true);
  };
  
  const exportarPDF = () => {
    playSound();
    const doc = new jsPDF();
    const ganhos = financials.ganhos[reportPeriod];
    const despesas = financials.despesas[reportPeriod];
    const saldo = financials.saldo[reportPeriod];
    const periodoLabel = { dia: 'Diário', semana: 'Semanal', quinzena: 'Quinzenal', mes: 'Mensal'}[reportPeriod];

    doc.setFontSize(22);
    doc.text("Relatório Financeiro - StudioGestor Pro", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Período: ${periodoLabel}`, 105, 30, { align: 'center' });
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 105, 35, { align: 'center' });

    doc.setFontSize(16);
    doc.text("Resumo", 14, 50);
    doc.setFontSize(12);
    doc.text(`Ganhos: R$ ${ganhos.toFixed(2)}`, 14, 60);
    doc.text(`Despesas: R$ ${despesas.toFixed(2)}`, 14, 65);
    doc.setFontSize(14);
    doc.text(`Saldo: R$ ${saldo.toFixed(2)}`, 14, 75);

    doc.save(`relatorio_financeiro_${reportPeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: `📄 PDF ${periodoLabel} Gerado!`, description: "Seu relatório foi exportado com sucesso." });
    setShowPdfConfirm(false);
  };

  const handleSendSummary = () => {
    if (!whatsAppNumber) {
        toast({ title: 'Número inválido', description: 'Por favor, insira um número de WhatsApp.', variant: 'destructive' });
        return;
    }
    playSound();
    toast({
      title: "📱 Resumo enviado via WhatsApp!",
      description: `Relatório financeiro enviado para ${whatsAppNumber}!`,
    });
    setWhatsAppNumber('');
  };

  return (
    <>
        <div className="grid grid-cols-2 gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl btn-sound w-full">
                  <FileText size={16} className="mr-2" /> Exportar PDF <Filter size={14} className="ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup value={reportPeriod} onValueChange={handleReportPeriodChange}>
                  <DropdownMenuRadioItem value="dia">Relatório do Dia</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="semana">Relatório da Semana</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="quinzena">Relatório da Quinzena</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mes">Relatório do Mês</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                 <Button variant="outline" className="h-12 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl btn-sound"><MessageSquare size={16} className="mr-2" /> Resumo do Dia</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Resumo do Dia</DialogTitle>
                  <DialogDescription>
                    Digite o número de WhatsApp para enviar o resumo financeiro de hoje.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <input 
                    type="tel"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                      <Button onClick={handleSendSummary}>Enviar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>

        <AlertDialog open={showPdfConfirm} onOpenChange={setShowPdfConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Gerar Relatório PDF?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você deseja gerar o relatório do período: <span className="font-semibold text-primary">{reportPeriod}</span>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={exportarPDF}>Gerar PDF</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
};