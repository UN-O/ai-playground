'use client';
import { useEffect, useRef, useState } from "react";
import styles from "./smile-plot.module.css";
import { RefreshCw } from "lucide-react"
interface RenderConfig {
	type: string;
	canvasId: string;
	dimensions?: {
		width: number;
		height: number;
	};
}

// TODO 
export default function SmilePlot({
	id,
	title,
	smiles,
	render,
}: {
	id: string;
	title: string;
	smiles: string;
	render: RenderConfig;
}) {
	const [viewMode, setViewMode] = useState<"2D" | "3D Dynamic" | "3D Rotation">(
		"3D Rotation"
	);
	const [molBlock, setMolBlock] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// We store the ChemDoodle canvas instance in a ref,
	// so we can stop its animation before removing the DOM element.
	const canvasInstanceRef = useRef<any>(null);

	// If the user doesn't pass in a canvasId, generate a random one
	const canvasId = `default-canvas-${id}`;

	// Clears the container DOM, and stops any ongoing animation on the old instance
	const clearCanvas = () => {
		// 1. Stop animation if the old instance is a RotatorCanvas or something similar
		if (canvasInstanceRef.current) {
			// For RotatorCanvas:
			if (typeof canvasInstanceRef.current.stopAnimation === "function") {
				canvasInstanceRef.current.stopAnimation();
			}
			// If there's a transformCanvas with custom intervals or repaint, you'd handle it similarly
			canvasInstanceRef.current = null;
		}

		// 2. Now remove the old canvas from the DOM
		const container = document.getElementById(`container-${canvasId}`);
		if (container) {
			container.innerHTML = "";
			const newCanvas = document.createElement("canvas");
			newCanvas.id = canvasId;
			newCanvas.className = "w-full h-auto block";
			container.appendChild(newCanvas);
		}
	};

	// Initializes RDKit and ChemDoodle to render the molecule
	const initializeRDKitAndRender = async () => {
		try {
			if (typeof ChemDoodle === "undefined") {
				console.error("ChemDoodle not loaded");
				return;
			}
			// if (!ChemDoodle) {
			// 	console.error("ChemDoodle not loaded");
			// 	return;
			// }
			if (typeof window.RDKit === "undefined") {
				console.log("Initializing RDKit...");
				const RDKitInstance = await (window as any).initRDKitModule({});
				(window as any).RDKit = RDKitInstance;
				console.log(
					"RDKit initialized successfully, version:",
					(window as any).RDKit.version
				);
			}

			// 1. Load molecule from SMILES
			let mol = (window as any).RDKit.get_mol(smiles);
			if (!mol) {
				throw new Error("Failed to create molecule from SMILES");
			}

			// 2. Convert to MolBlock
			setMolBlock(mol.get_molblock())
			mol.delete();
		} catch (error: any) {
			console.error("Error rendering molecule:", error);
			alert("Invalid SMILES string or rendering error: " + error.message);
		}
	};

	// trigger render based on view mode
	const triggerRender = () => {
		clearCanvas();
		if (!molBlock) {
			throw new Error("Failed to generate MOL block from SMILES");
		}
		switch (viewMode) {
			case "2D":
				render2D(molBlock);
				break;
			case "3D Dynamic":
				render3Dynamic(molBlock);
				break;
			case "3D Rotation":
				render3DRotation(molBlock);
				break;
			default:
				render3Dynamic(molBlock);
		}
	}

	// 2D rendering
	const render2D = (molBlock: string) => {
		const viewerCanvas = new ChemDoodle.ViewerCanvas(canvasId, 300, 300); 5
		// width of the bonds for 2D depiction
		viewerCanvas.styles.bonds_width_2D = 1.5;
		// absolute saturation width of double and triple bond lines for 2D depiction
		viewerCanvas.styles.bonds_saturationWidthAbs_2D = 4.6;
		// the spacing of hashes for 2D depiction
		viewerCanvas.styles.bonds_hashSpacing_2D = 4.5;
		// atom text font size for 2D depiction
		viewerCanvas.styles.atoms_font_size_2D = 20;

		// show labels for terminal carbons
		viewerCanvas.styles.atoms_displayTerminalCarbonLabels_2D = true;

		const molecule = ChemDoodle.readMOL(molBlock);
		if (!molecule) {
			throw new Error("Failed to parse MOL block into a molecule");
		}

		// Adjust bond lengths
		molecule.scaleToAverageBondLength(40); // Default is around 14.4. Increase this value for longer bonds.

		// Save the instance in a ref in case you need to do anything with it
		canvasInstanceRef.current = viewerCanvas;
		viewerCanvas.loadMolecule(molecule);
	};

	// 3D dynamic rendering (rotatable by mouse)
	const render3Dynamic = (molBlock: string) => {
		const transformCanvas = new ChemDoodle.TransformCanvas3D(canvasId, 300, 300);
		transformCanvas.styles.set3DRepresentation("Ball and Stick");
		transformCanvas.styles.backgroundColor = "black";
		transformCanvas.mouseInteractions = true;

		const molecule = ChemDoodle.readMOL(molBlock, 1);
		if (!molecule) {
			throw new Error("Failed to parse MOL block into a molecule");
		}

		// Save the instance
		canvasInstanceRef.current = transformCanvas;
		transformCanvas.loadMolecule(molecule);
	};

	// 3D auto rotation
	const render3DRotation = (molBlock: string) => {
		const rotateCanvas = new ChemDoodle.RotatorCanvas(canvasId, 300, 300, true);
		rotateCanvas.styles.atoms_useJMOLColors = true;
		rotateCanvas.styles.backgroundColor = "transparent";
		// 移除背景，讓外層容器的 bg-gray-100 顯示出來
		rotateCanvas.styles.outline_width_3D = 0;


		// width of the bonds for 2D depiction
		rotateCanvas.styles.bonds_width_2D = 1.5;
		// absolute saturation width of double and triple bond lines for 2D depiction
		rotateCanvas.styles.bonds_saturationWidthAbs_2D = 4.6;
		// the spacing of hashes for 2D depiction
		rotateCanvas.styles.bonds_hashSpacing_2D = 4.5;
		// atom text font size for 2D depiction
		rotateCanvas.styles.atoms_font_size_2D = 20;

		const molecule = ChemDoodle.readMOL(molBlock);
		if (!molecule) {
			throw new Error("Failed to parse MOL block into a molecule");
		}

		// Save the instance
		canvasInstanceRef.current = rotateCanvas;
		rotateCanvas.loadMolecule(molecule);
		rotateCanvas.startAnimation();
	};

	useEffect(() => {

		if (!isMounted) {
			setIsMounted(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Clear + re-render each time smiles/viewMode/renderTrigger changes
	useEffect(() => {
		clearCanvas();            // stop old instance & remove DOM

		if (smiles && isMounted && !isInitialized) {
			// Start transition to show loading spinner
			initializeRDKitAndRender();
			setIsInitialized(true);
		} // render new instance {

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [smiles, isMounted]);

	// Re-render when view mode changes
	useEffect(() => {
		if (isMounted && isInitialized && molBlock) {
			triggerRender();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewMode, molBlock]);

	// Also, if you unmount this component, stop any possible animations
	useEffect(() => {
		return () => {
			if (canvasInstanceRef.current) {
				if (typeof canvasInstanceRef.current.stopAnimation === "function") {
					canvasInstanceRef.current.stopAnimation();
				}
			}
		};
	}, []);


	return (
		<div className="w-full max-w-md grid gap-4">
			<div>
				<h2 className="text-xl font-semibold">{title}</h2>
				<p className="text-gray-600 text-xs">SMILES: {smiles}</p>
			</div>

			{/* 化學結構圖 */}
			<div
				id={`container-${canvasId}`}
				className="
							relative
							w-full
							place-items-center
							max-w-[600px] 
							mx-auto 
							overflow-hidden
							bg-gray-100
							rounded-md
							shadow
						"
			>
			</div>

			{/* 選單 */}
			<div className="flex items-center justify-between w-full">
				<select
					className="border border-gray-300 rounded px-2 py-1"
					value={viewMode}
					onChange={(e) => setViewMode(e.target.value as "2D" | "3D Dynamic" | "3D Rotation")}
				>
					<option value="2D">2D View</option>
					<option value="3D Rotation">3D Rotation</option>
				</select>
				<button
					className={`${styles.renderButton} h-fit w-fit`}
					onClick={() => triggerRender()}
				>
					<RefreshCw className="h-4 w-4" />
				</button>
			</div>



		</div>
	);
}
