'use client';
import { useEffect, useRef, useState } from "react";
import styles from "./smile-plot.module.css";
import { RefreshCw } from "lucide-react";

export default function SmilePlot({ result }) {
	const [viewMode, setViewMode] = useState("3D Rotation");
	const [molBlock, setMolBlock] = useState(null);
	const [initialized, setInitialized] = useState(false);
	const [error, setError] = useState("");
	const canvasInstanceRef = useRef(null);
	const canvasIdRef = useRef(`default-canvas-${Math.random().toString(36).substring(7)}`);

	// 清除舊的 canvas 與停止動畫
	const clearCanvas = () => {
		if (canvasInstanceRef.current && typeof canvasInstanceRef.current.stopAnimation === "function") {
			canvasInstanceRef.current.stopAnimation();
		}
		canvasInstanceRef.current = null;
		const container = document.getElementById(`container-${canvasIdRef.current}`);
		if (container) {
			container.innerHTML = "";
			const newCanvas = document.createElement("canvas");
			newCanvas.id = canvasIdRef.current;
			newCanvas.className = "w-full h-auto block";
			container.appendChild(newCanvas);
		}
	};

	// 初始化 RDKit 與 ChemDoodle，並生成 molBlock
	const initializeRDKitAndRender = async () => {
		setError(""); // 清除錯誤訊息
		try {
			if (typeof ChemDoodle === "undefined") {
				setError("Smile 有問題");
				return;
			}
			if (typeof window.RDKit === "undefined") {
				console.log("Initializing RDKit...");
				const RDKitInstance = await window.initRDKitModule({});
				window.RDKit = RDKitInstance;
				console.log("RDKit initialized successfully, version:", window.RDKit.version);
			}
			let mol;
			try {
				mol = window.RDKit.get_mol(result?.smiles);
			} catch (e) {
				mol = null;
			}
			if (!mol) {
				setError("Smile 有問題");
				return;
			}
			setMolBlock(mol.get_molblock());
			mol.delete();
		} catch (error) {
			setError("Smile 有問題");
		}
	};

	// 根據 viewMode 觸發渲染
	const triggerRender = () => {
		setError(""); // 清除錯誤訊息
		clearCanvas();
		if (!molBlock) {
			setError("Smile 有問題");
			return;
		}
		// 根據 viewMode 選擇渲染方式
		if (viewMode === "2D") {
			render2D(molBlock);
		} else if (viewMode === "3D Dynamic") {
			render3Dynamic(molBlock);
		} else {
			render3DRotation(molBlock);
		}
	};

	// 2D 渲染
	const render2D = (molBlock) => {
		const viewerCanvas = new ChemDoodle.ViewerCanvas(canvasIdRef.current, 300, 300);
		viewerCanvas.styles.bonds_width_2D = 1.5;
		viewerCanvas.styles.bonds_saturationWidthAbs_2D = 4.6;
		viewerCanvas.styles.bonds_hashSpacing_2D = 4.5;
		viewerCanvas.styles.atoms_font_size_2D = 20;
		viewerCanvas.styles.atoms_displayTerminalCarbonLabels_2D = true;

		const molecule = ChemDoodle.readMOL(molBlock);
		if (!molecule) {
			setError("Smile 有問題");
			return;
		}
		molecule.scaleToAverageBondLength(40);
		canvasInstanceRef.current = viewerCanvas;
		viewerCanvas.loadMolecule(molecule);
	};

	// 3D 動態渲染（可滑鼠互動）
	const render3Dynamic = (molBlock) => {
		const transformCanvas = new ChemDoodle.TransformCanvas3D(canvasIdRef.current, 300, 300);
		transformCanvas.styles.set3DRepresentation("Ball and Stick");
		transformCanvas.styles.backgroundColor = "black";
		transformCanvas.mouseInteractions = true;

		const molecule = ChemDoodle.readMOL(molBlock, 1);
		if (!molecule) {
			setError("Smile 有問題");
			return;
		}
		canvasInstanceRef.current = transformCanvas;
		transformCanvas.loadMolecule(molecule);
	};

	// 3D 自動旋轉
	const render3DRotation = (molBlock) => {
		const rotateCanvas = new ChemDoodle.RotatorCanvas(canvasIdRef.current, 300, 300, true);
		rotateCanvas.styles.atoms_useJMOLColors = true;
		rotateCanvas.styles.backgroundColor = "transparent";
		rotateCanvas.styles.outline_width_3D = 0;
		rotateCanvas.styles.bonds_width_2D = 1.5;
		rotateCanvas.styles.bonds_saturationWidthAbs_2D = 4.6;
		rotateCanvas.styles.bonds_hashSpacing_2D = 4.5;
		rotateCanvas.styles.atoms_font_size_2D = 20;

		const molecule = ChemDoodle.readMOL(molBlock);
		if (!molecule) {
			setError("Smile 有問題");
			return;
		}
		canvasInstanceRef.current = rotateCanvas;
		rotateCanvas.loadMolecule(molecule);
		rotateCanvas.startAnimation();
	};

	// 第一次掛載後初始化
	useEffect(() => {
		if (result?.smiles && !initialized) {
			initializeRDKitAndRender();
			setInitialized(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [result?.smiles]);

	// 當 viewMode 或 molBlock 改變時重新渲染
	useEffect(() => {
		if (initialized && molBlock) {
			triggerRender();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewMode, molBlock]);

	// 組件卸載時停止動畫
	useEffect(() => {
		return () => {
			if (canvasInstanceRef.current && typeof canvasInstanceRef.current.stopAnimation === "function") {
				canvasInstanceRef.current.stopAnimation();
			}
		};
	}, []);

	return (
		<div className="w-full max-w-md grid gap-4">
			<div>
				<h2 className="text-xl font-semibold">{result?.title}</h2>
				<p className="text-gray-600 text-xs">SMILES: {result?.smiles}{error}</p>
			</div>
			{error && (
				<div className="">
					<span className="text-red-600 font-bold">{error}</span>
				</div>
			)}

			<div
				id={`container-${canvasIdRef.current}`}
				className={`relative w-full place-items-center max-w-[600px] min-h-[300px] mx-auto overflow-hidden bg-gray-100 rounded-md shadow ${ molBlock ? '' : (!error) ? 'animate-pulse' : 'hidden' }`}
			/>

			<div className="flex items-center justify-between w-full">
				<select
					className="border border-gray-300 rounded px-2 py-1"
					value={viewMode}
					onChange={(e) => setViewMode(e.target.value)}
				>
					<option value="2D">2D View</option>
					<option value="3D Rotation">3D Rotation</option>
					{/* 如有需要可加入 "3D Dynamic" */}
				</select>
				<button className={`${styles.renderButton} h-fit w-fit`} onClick={triggerRender}>
					<RefreshCw className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
