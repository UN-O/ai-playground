'use client';
import { useEffect, useRef, useState } from "react";
import styles from "./smile-plot.module.css";

interface RenderConfig {
  type: string;
  canvasId: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export default function SmilePlot({
  title,
  smiles,
  render,
}: {
  title: string;
  smiles: string;
  render: RenderConfig;
}) {
  const [viewMode, setViewMode] = useState<"2D" | "3D Dynamic" | "3D Rotation">(
    "3D Rotation"
  );
  const [renderTrigger, setRenderTrigger] = useState(false);

  // We store the ChemDoodle canvas instance in a ref,
  // so we can stop its animation before removing the DOM element.
  const canvasInstanceRef = useRef<any>(null);

  // If the user doesn't pass in a canvasId, generate a random one
  const canvasId =
    render?.canvasId || `default-canvas-${Math.random().toString(36).substring(7)}`;

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
      const molBlock = mol.get_molblock();
      mol.delete();

      if (!molBlock) {
        throw new Error("Failed to generate MOL block from SMILES");
      }

      // 3. Render the molecule based on view mode
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
    } catch (error: any) {
      console.error("Error rendering molecule:", error);
      alert("Invalid SMILES string or rendering error: " + error.message);
    }
  };

  // 2D rendering
  const render2D = (molBlock: string) => {
    const viewerCanvas = new ChemDoodle.ViewerCanvas(canvasId, 300, 300);
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
    rotateCanvas.styles.backgroundColor = '#E4FFC2';
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

  // Clear + re-render each time smiles/viewMode/renderTrigger changes
  useEffect(() => {
    clearCanvas();            // stop old instance & remove DOM
    initializeRDKitAndRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smiles, viewMode, renderTrigger]);

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
    <div style={{ marginTop: "20px" }}>
      <h2>{title}</h2>
      <p>SMILES: {smiles}</p>

      <div style={{ marginBottom: "10px" }}>
        <label>View Mode: </label>
        <select
          className={styles.viewModeSelect}
          value={viewMode}
          onChange={(e) =>
            setViewMode(e.target.value as "2D" | "3D Dynamic" | "3D Rotation")
          }
        >
          <option value="2D">2D View</option>
          {/* <option value="3D Dynamic">3D Dynamic</option> */}
          <option value="3D Rotation">3D Rotation</option>
        </select>
        <button
          className={styles.renderButton}
          onClick={() => setRenderTrigger((prev) => !prev)}
        >
          Re-Render
        </button>
      </div>

      <div
        id={`container-${canvasId}`}
        style={{ position: "relative", width: "300px", height: "300px" }}
      />
    </div>
  );
}
