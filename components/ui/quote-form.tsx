"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Ruler, Layers, Hash, Calculator, CheckCircle2, SendHorizonal, Clock, ShieldCheck, Info, Trash2, Plus, User, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { TemplarisLogo } from "@/components/templaris-logo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  calculatePrice,
  formatARS,
  rawGlassData,
  type GlassType,
  type CalculationOptions
} from "@/lib/pricing"


// Añadimos el paso "checkout"
type Step = "form" | "checkout" | "thanks"

interface QuoteItem {
  id: string;
  description: string;
  details: string;
  price: number;
  quantity: number;
}

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};


export function QuoteForm() {
    // --- ESTADOS DEL FORMULARIO ACTUAL ---
    const [glassType, setGlassType] = useState<GlassType | "">("")
    const [mainGlassIndex, setMainGlassIndex] = useState<string>("")
    const [secondGlassIndex, setSecondGlassIndex] = useState<string>("")
    const [width, setWidth] = useState("")
    const [height, setHeight] = useState("")
    const [quantity, setQuantity] = useState("1")

    // --- ESTADOS PARA ITEM MANUAL ---
    const [manualDescription, setManualDescription] = useState("")
    const [manualPrice, setManualPrice] = useState("")
    const [showManual, setShowManual] = useState(false) // Para mostrar/ocultar los campos
    
    // Opciones adicionales
    const [urgent, setUrgent] = useState(false)
    const [bordePulido, setBordePulido] = useState(false)
    const [calados, setCalados] = useState("0")
    const [pasaVoz, setPasaVoz] = useState(false)
    const [puntasRedondeadas, setPuntasRedondeadas] = useState(false)
    const [camaraMm, setCamaraMm] = useState<"6" | "9" | "12">("9")

    // Descuentos
    const [discount, setDiscount] = useState("0") // Estado para el porcentaje de descuento

    // --- ESTADO DE DATOS DEL CLIENTE ---
    const [customerData, setCustomerData] = useState({
        name: "",
        phone: "",
        email: ""
    })

    // --- ESTADO DE LA LISTA DE COTIZACIÓN (CARRITO) ---
    const [items, setItems] = useState<QuoteItem[]>([])
    const [step, setStep] = useState<Step>("form")

	// --- GENERADOR DEL PDF ---
	const generatePDF = async () => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();

		// --- CONFIGURACIÓN DE COLORES ---
		const primaryColor = [26, 28, 110]; // El azul de tu marca #1a1c6e
		const accentColor = [234, 179, 8];  // El amarillo de la advertencia

		// --- CABECERA ---
		// Rectángulo estético superior

		// Texto del Logo (Opcional si no tienes el base64 de la imagen, 
		// pero aquí lo ponemos como texto estilizado de Templaris)

		// --- CARGAR LOGO ---
		try {
			const logoData = await getBase64ImageFromURL("/images/logo.png");
			// addImage(datos, formato, x, y, ancho, alto)
			doc.addImage(logoData, "PNG", 140, 10, 60, 24); 
		} catch (e) {
			console.error("No se pudo cargar el logo", e);
			// Fallback: Si no carga el logo, ponemos el texto
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(20);
			doc.setFont("helvetica", "bold");

			doc.text("TEMPLARIS", 15, 25);
			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			doc.text("Soluciones Vidrieras de Alta Calidad", 15, 32);
		}

		
		

		// --- INFORMACIÓN DEL CLIENTE ---
		doc.setTextColor(40, 40, 40);
		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("DATOS DEL CLIENTE:", 15, 55);
		
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.text(`Nombre: ${customerData.name}`, 15, 62);
		doc.text(`Teléfono: ${customerData.phone}`, 15, 68);
		doc.text(`Email: ${customerData.email || "No provisto"}`, 15, 74);
		doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 15, 72, { align: "right" });

		// --- TABLA DE PRODUCTOS ---
		const tableRows = items.map(item => [
			item.description,
			item.details,
			item.quantity.toString(),
			formatARS(item.price),
			formatARS(item.price * item.quantity)
		]);

		autoTable(doc, {
			startY: 85,
			head: [['Producto', 'Detalles', 'Cant.', 'Precio Unit.', 'Subtotal']],
			body: tableRows,
			theme: 'striped',
			headStyles: {
				fillColor: primaryColor,
				textColor: [255, 255, 255],
				fontSize: 10,
				fontStyle: 'bold',
				halign: 'center'
			},
			columnStyles: {
				0: { cellWidth: 40 },
				1: { cellWidth: 'auto' },
				2: { halign: 'center' },
				3: { halign: 'right' },
				4: { halign: 'right', fontStyle: 'bold' }
			},
			styles: { fontSize: 9, cellPadding: 5 }
		});

		// --- TOTAL ---

		// --- SECCIÓN DE TOTALES (SUBTOTAL, IVA, TOTAL) ---
		const finalY = (doc as any).lastAutoTable.finalY + 10;
        const discount = discountAmount
        const totalBrute = subtotalQuote
		const subtotal = totalQuote;
		const iva = subtotal * 0.21;
		const totalConIva = subtotal + iva;

		const marginX = pageWidth - 15;

		doc.setFontSize(10);
		doc.setTextColor(80, 80, 80);

		// Subtotal
		doc.text("Subtotal:", marginX - 50, finalY);
		doc.text(formatARS(totalBrute), marginX, finalY, { align: "right" });

        let plusPosition = 0
        if(discountAmount){
            plusPosition = 7
            doc.text("Descuento:", marginX - 50, finalY + plusPosition);
		    doc.text(`- ${formatARS(discountAmount)}`, marginX, finalY + plusPosition, { align: "right" });
        }

		// IVA
		doc.text("IVA (21.00%):", marginX - 50, finalY + plusPosition + 7);
		doc.text(formatARS(iva), marginX, finalY + plusPosition + 7, { align: "right" });

		// Línea divisoria
		doc.setDrawColor(200, 200, 200);
		doc.line(marginX - 55, finalY + plusPosition + 10, marginX, finalY + plusPosition + 10);

		// Total final
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
		doc.text("TOTAL:", marginX - 50, finalY + plusPosition + 17);
		doc.text(formatARS(totalConIva), marginX, finalY + plusPosition + 17, { align: "right" });

		// --- PIE DE PÁGINA ---
		doc.setFontSize(8);
		doc.setTextColor(150, 150, 150);
		const footerText = "Este documento es una cotización orientativa sujeta a revisión técnica.";
		doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

		// --- ABRIR EN NUEVA PESTAÑA ---
		const pdfUrl = doc.output('bloburl');
		window.open(pdfUrl, '_blank');
	};

    // --- LÓGICA DE FILTRADO ---
    const availableGlasses = useMemo(() => {
        if (!glassType) return []
        return rawGlassData.map((g, index) => ({ ...g, index })).filter(g => {
            if (glassType === "templado") return !!g["Precio Templado"]
            if (glassType === "dvh") return !!g["Precio para DVH"]
            if (glassType === "laminado") return !!g["Precio para Laminado"]
            if (glassType === "espejos") return g["Nombre vidrio"].toUpperCase().includes("ESPEJO")
            return !!g["precio para crudo"]
        })
    }, [glassType])

    // Cálculo en tiempo real
    const currentCalculation = useMemo(() => {
        if (!glassType || mainGlassIndex === "" || !width || !height) return null
        const w = parseFloat(width); const h = parseFloat(height); const q = parseInt(quantity)
        if (isNaN(w) || isNaN(h) || q <= 0) return null

        const options: CalculationOptions = {
            urgent, bordePulido, calados: parseInt(calados) || 0, pasaVoz, puntasRedondeadas,
            camaraMm: parseInt(camaraMm) as any,
            vidrioSecundarioIndex: secondGlassIndex !== "" ? parseInt(secondGlassIndex) : undefined
        }

        return calculatePrice(glassType, parseInt(mainGlassIndex), w, h, q, options)
    }, [glassType, mainGlassIndex, secondGlassIndex, width, height, quantity, urgent, bordePulido, calados, pasaVoz, puntasRedondeadas, camaraMm])

    const isFormValid = !!currentCalculation && ((glassType === "dvh" || glassType === "laminado") ? secondGlassIndex !== "" : true)
    
    // Validación de datos de contacto
    const isContactValid = customerData.name.trim().length > 2 && customerData.phone.trim().length > 6

    // --- MANEJADORES ---
    const addItem = () => {
		if (!currentCalculation) return;
		
		const mainG = rawGlassData[parseInt(mainGlassIndex)];
		let fullDescription = mainG["Nombre vidrio"];

		// Si es DVH o Laminado, armamos el nombre compuesto
		if ((glassType === "dvh" || glassType === "laminado") && secondGlassIndex !== "") {
			const secondG = rawGlassData[parseInt(secondGlassIndex)];
			const separator = glassType === "dvh" ? ` / Cam ${camaraMm}mm / ` : " + ";
			fullDescription = `${mainG["Nombre vidrio"]}${separator}${secondG["Nombre vidrio"]}`;
		}

		const newItem: QuoteItem = {
			id: Math.random().toString(36).substr(2, 9),
			description: fullDescription, // <-- Aquí guardamos el nombre largo
			details: `${width}x${height}mm | ${glassType.toUpperCase()} ${urgent ? '(Urgente)' : ''}`,
			price: currentCalculation.unitPrice,
			quantity: parseInt(quantity)
		};
		
		setItems([...items, newItem]);
		setQuantity("1");
	};

    //-- Función para agregar el item manual --
    const addManualItem = () => {
        const price = parseFloat(manualPrice);
        if (!manualDescription || isNaN(price)) return;

        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: manualDescription,
            details: "Accesorio / Servicio extra",
            price: price,
            quantity: 1
        };

        setItems([...items, newItem]);
        // Limpiamos campos y cerramos
        setManualDescription("");
        setManualPrice("");
        setShowManual(false);
    };

    const removeItem = (id: string) => setItems(items.filter(i => i.id !== id))

    const subtotalQuote = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const discountAmount = useMemo(() => {
        const d = parseFloat(discount) || 0
        return (subtotalQuote * d) / 100
    }, [subtotalQuote, discount])

    const totalQuote = subtotalQuote - discountAmount

    return (
        <div className="min-h-screen bg-secondary/30">
            <div className="bg-white text-primary h-[90px]" />

            <main className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
                
                {/* STEP 1: FORMULARIO DE COTIZACIÓN */}
                {step === "form" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 border-b pb-4">
                                <Plus className="text-primary h-5 w-5" />
                                <h2 className="font-bold font-mono text-lg">Configurar Vidrio</h2>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Tipo</Label>
                                        <Select value={glassType} onValueChange={(val) => { setGlassType(val as GlassType); setMainGlassIndex(""); setSecondGlassIndex(""); }}>
                                            <SelectTrigger className="bg-background"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="crudo">Crudo</SelectItem>
												<SelectItem value="planchas">Por Plancha</SelectItem>
                                                <SelectItem value="templado">Templado</SelectItem>
                                                <SelectItem value="dvh">DVH</SelectItem>
                                                <SelectItem value="laminado">Laminado</SelectItem>
                                                <SelectItem value="espejos">Espejo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Vidrio Principal</Label>
                                        <Select value={mainGlassIndex} onValueChange={setMainGlassIndex} disabled={!glassType}>
                                            <SelectTrigger><SelectValue placeholder="Espesor/Color" /></SelectTrigger>
                                            <SelectContent>
                                                {availableGlasses.map((g) => (
                                                    <SelectItem key={g.index} value={g.index.toString()}>{g["Nombre vidrio"]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {(glassType === "dvh" || glassType === "laminado") && (
                                    <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Vidrio Secundario</Label>
                                            <Select value={secondGlassIndex} onValueChange={setSecondGlassIndex}>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                <SelectContent>
                                                    {availableGlasses.map((g) => (
                                                        <SelectItem key={g.index} value={g.index.toString()}>{g["Nombre vidrio"]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {glassType === "dvh" && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-muted-foreground">Cámara</Label>
                                                <Select value={camaraMm} onValueChange={(v: any) => setCamaraMm(v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="6">6mm</SelectItem>
                                                        <SelectItem value="9">9mm</SelectItem>
                                                        <SelectItem value="12">12mm</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Ancho (mm)</Label>
                                        <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Alto (mm)</Label>
                                        <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Cant.</Label>
                                        <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                                    </div>
                                </div>

                                <div className="p-4 bg-secondary/40 rounded-lg grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="urgent" checked={urgent} onCheckedChange={(v) => setUrgent(!!v)} />
                                            <label htmlFor="urgent" className="text-sm font-medium leading-none cursor-pointer">Entrega Urgente (+50%)</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="bordePulido" checked={bordePulido} onCheckedChange={(v) => setBordePulido(!!v)} />
                                            <label htmlFor="bordePulido" className="text-sm font-medium leading-none cursor-pointer">Borde Pulido</label>
                                        </div>
                                        {/* INPUT DE CALADOS AGREGADO AQUÍ */}
										<div className="flex flex-col gap-2">
												<Label htmlFor="calados" className="text-xs font-bold uppercase text-muted-foreground">Cant. de Calados</Label>
												<Input 
													id="calados"
													type="number" 
													min="0"
													className="h-9 w-24 bg-background" 
													value={calados} 
													onChange={(e) => setCalados(e.target.value)} 
												/>
										</div>
                                    </div>
                                    {glassType === "templado" && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="pasavoz" checked={pasaVoz} onCheckedChange={(v) => setPasaVoz(!!v)} />
                                                <label htmlFor="pasavoz" className="text-sm cursor-pointer">Pasa voz</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox id="puntas" checked={puntasRedondeadas} onCheckedChange={(v) => setPuntasRedondeadas(!!v)} />
                                                <label htmlFor="puntas" className="text-sm cursor-pointer">Puntas redondeadas</label>
                                            </div>
											
                                        </div>
                                    )}

                                    
                                </div>
                                {/* SECCIÓN DE ITEM MANUAL */}
                                    <div className="pt-4 border-t flex justify-start">
                                        {!showManual ? (
                                            <Button 
                                                variant="outline" 
                                                className="h-10 px-6 border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/50 transition-all text-xs font-bold"
                                                onClick={() => setShowManual(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Agregar Item Manual (Corte con Formas, Envío, etc.)
                                            </Button>
                                        ) : (
                                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-xs font-bold uppercase text-primary">Nuevo Item Extra</h4>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowManual(false)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="grid gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase">Descripción</Label>
                                                        <Input 
                                                            placeholder="Ej: Kit de herrajes para puerta" 
                                                            value={manualDescription}
                                                            onChange={(e) => setManualDescription(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase">Precio Unitario ($)</Label>
                                                        <Input 
                                                            type="number" 
                                                            placeholder="0.00" 
                                                            value={manualPrice}
                                                            onChange={(e) => setManualPrice(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={addManualItem}
                                                        disabled={!manualDescription || !manualPrice}
                                                    >
                                                        Confirmar Item
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                            </div>

                            <Button size="lg" className="w-full font-bold" disabled={!isFormValid} onClick={addItem}>
                                <Plus className="h-5 w-5 mr-2" /> Agregar a la lista
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-card rounded-xl border shadow-md flex flex-col h-full overflow-hidden">
                            <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
                                <h3 className="font-bold font-mono text-lg">Tu Presupuesto</h3>
                                <Badge variant="outline" className="text-white border-white">{items.length} items</Badge>
                            </div>
                            
                            <div className="flex-1 p-4 max-h-[400px] overflow-y-auto">
                                {items.length === 0 ? (
                                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 text-center">
                                        <Calculator className="h-8 w-8 opacity-20" />
                                        <p className="text-sm">Configura un vidrio y agrégalo para ver el total</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start border-b pb-3 group">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm leading-none">{item.description}</p>
                                                    <p className="text-[11px] text-muted-foreground">{item.details}</p>
                                                    <p className="text-xs font-semibold">{item.quantity} un. x {formatARS(item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono font-bold text-sm">{formatARS(item.price * item.quantity)}</span>
                                                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                                <div className="flex items-center justify-between bg-background p-2 rounded-md border border-dashed">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">%</Badge>
                                            <Label htmlFor="discount" className="text-[10px] font-bold uppercase">Aplicar Descuento</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                id="discount"
                                                type="number" 
                                                className="h-8 w-16 text-right font-bold" 
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                min="0"
                                                max="100"
                                            />
                                            <span className="text-xs font-bold">%</span>
                                        </div>
                                </div>
                            <div className="p-5 bg-secondary/50 border-t">

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Subtotal:</span>
                                        <span>{formatARS(subtotalQuote)}</span>
                                    </div>
                                    {parseFloat(discount) > 0 && (
                                        <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                            <span>Descuento ({discount}%):</span>
                                            <span>-{formatARS(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-2">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Estimado</p>
                                            <p className="text-[10px] text-muted-foreground italic">Precios sin IVA</p>
                                        </div>
                                        <p className="text-3xl font-bold font-mono text-primary">{formatARS(totalQuote)}</p>
                                    </div>
                                </div>
                                
                                <Button 
                                    className="w-full mt-5 h-12 text-base font-bold" 
                                    disabled={items.length === 0} 
                                    onClick={() => setStep("checkout")}
                                >
                                    <SendHorizonal className="h-5 w-5 mr-2" /> Enviar Consulta Final
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* STEP 2: FORMULARIO DE CONTACTO (CHECKOUT) */}
                {step === "checkout" && (
                    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                            <div className="bg-primary p-6 text-primary-foreground text-center">
                                <h2 className="text-2xl font-bold font-mono mb-2">Un último paso...</h2>
                                <p className="text-primary-foreground/80 text-sm">Necesitamos tus datos para enviarte el presupuesto formal.</p>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Nombre y Apellido *</Label>
                                        <Input 
                                            placeholder="Ej: Juan Pérez" 
                                            className="h-12"
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> WhatsApp / Teléfono *</Label>
                                        <Input 
                                            placeholder="Ej: 11 2233 4455" 
                                            className="h-12"
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email (Opcional)</Label>
                                        <Input 
                                            type="email" 
                                            placeholder="juan@ejemplo.com" 
                                            className="h-12"
                                            value={customerData.email}
                                            onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="bg-secondary/50 p-4 rounded-lg border flex justify-between items-center">
                                    <span className="text-sm font-medium">Total de la consulta:</span>
                                    <span className="text-xl font-bold font-mono text-primary">{formatARS(totalQuote)}</span>
                                </div>

                                <div className="flex flex-col gap-3">
        
									<Button 
										size="lg" 
										className="h-14 text-lg font-bold w-full" 
										disabled={!isContactValid}
										onClick={() => {
											generatePDF(); // Genera el PDF
											setStep("thanks"); // Pasa a la pantalla de gracias
										}}
									>
										Confirmar y Enviar
									</Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setStep("form")}
                                    >
                                        Volver a la lista
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: GRACIAS */}
                {step === "thanks" && (
                <div className="max-w-md mx-auto rounded-xl border border-border bg-card p-8 sm:p-12 shadow-sm text-center animate-in zoom-in duration-300">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                        <ShieldCheck className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground font-mono mb-3">¡Solicitud Enviada!</h2>
                    <p className="text-muted-foreground mb-8">
                        Gracias <strong>{customerData.name}</strong>. Hemos recibido tu pedido por un total de {formatARS(totalQuote)}. Un asesor te contactará al {customerData.phone} en menos de 24hs hábiles.
                    </p>
                    <Button 
                        size="lg" 
                        className="w-full h-12" 
                        onClick={() => { 
                            setStep("form"); 
                            setItems([]); 
                            setDiscount("0")
                            setBordePulido(false)
                            setCustomerData({name: "", phone: "", email: ""});
                        }}
                    >
                        Nueva Cotización
                    </Button>
                </div>
                )}
            </main>

            <footer className="border-t border-border bg-card py-8 mt-auto text-center text-sm text-muted-foreground">
                <p>Templaris © 2024 | Soluciones Vidrieras de Alta Calidad</p>
            </footer>
        </div>
    )
}