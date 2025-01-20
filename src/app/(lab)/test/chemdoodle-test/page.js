'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function ChemDoodleComponent() {
    const [smiles, setSmiles] = useState('CN=C=O'); 
    const [viewMode, setViewMode] = useState('3D Rotation'); 
    const [renderTrigger, setRenderTrigger] = useState(false);

    // 新增：透過 useRef 來存各種 ChemDoodle canvas 的實例
    const canvasInstanceRef = useRef(null);

    const clearCanvas = () => {
        // 1. 先停止前一個 canvas 的 animation，避免舊的動畫還在跑
        if (canvasInstanceRef.current) {
            // RotatorCanvas 有 stopAnimation()
            // TransformCanvas3D 沒有 stopAnimation，但也要停止重新繪製
            // ChemDoodle 的作法通常是 stopAnimation 或自定義的停止
            if (canvasInstanceRef.current.stopAnimation) {
                canvasInstanceRef.current.stopAnimation();
            }
            canvasInstanceRef.current = null;
        }

        // 2. 清除畫布
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.innerHTML = '<canvas id="canvasId"></canvas>';
        }
    };

    const initializeRDKitAndRender = async () => {
        try {
            if (typeof ChemDoodle === 'undefined') {
                console.error('ChemDoodle not loaded');
                return;
            }

            if (typeof window.RDKit === 'undefined') {
                console.log('Initializing RDKit...');
                const RDKitInstance = await window.initRDKitModule({});
                window.RDKit = RDKitInstance;
                console.log('RDKit initialized successfully, version:', window.RDKit.version);
            }

            const mol = window.RDKit.get_mol(smiles);
            if (!mol) {
                throw new Error('Failed to create molecule from SMILES');
            }
            
            const molBlock = mol.get_molblock();
            console.log('MOL block:', molBlock);
            // const molBlock = 'H2O\n  CHEMDOOD12280913053D\n\n  3  2  0     0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.0000    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\nM  END\n';
            mol.delete(); // Clean up memory

            if (!molBlock) {
                throw new Error('Failed to generate MOL block from SMILES');
            }

            switch (viewMode) {
                case '2D':
                    render2D(molBlock);
                    break;
                // case '3D Dynamic':
                //     render3Dynamic(molBlock);
                //     break;
                case '3D Rotation':
                    render3DRotation(molBlock);
                    break;
                default:
                    render3DRotation(molBlock);
            }
        } catch (error) {
            console.error('Error rendering molecule:', error);
            alert('Invalid SMILES string or rendering error: ' + error.message);
        }
    };

    const render2D = (molBlock) => {
        const viewerCanvas = new ChemDoodle.ViewerCanvas('canvasId', 300, 300);

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
            throw new Error('Failed to parse MOL block into a molecule');
        }

        // Adjust bond lengths
        molecule.scaleToAverageBondLength(40); // Default is around 14.4. Increase this value for longer bonds.

        viewerCanvas.loadMolecule(molecule);

        // 2D 沒有 animation，就不用特別 stop
        canvasInstanceRef.current = viewerCanvas;
    };

    const render3Dynamic = (molBlock) => {
        const transformBallAndStick = new ChemDoodle.TransformCanvas3D('canvasId', 300, 300);
        transformBallAndStick.styles.set3DRepresentation('Ball and Stick');
        transformBallAndStick.styles.backgroundColor = 'black';
        transformBallAndStick.mouseInteractions = true;

        const molecule = ChemDoodle.readMOL(molBlock, 1);
        if (!molecule) {
            throw new Error('Failed to parse MOL block into a molecule');
        }

        transformBallAndStick.loadMolecule(molecule);

        // 暫存實例
        canvasInstanceRef.current = transformBallAndStick;
    };

    const render3DRotation = (molBlock) => {
        const rotate3D = new ChemDoodle.RotatorCanvas('canvasId', 300, 300, true);
        rotate3D.styles.atoms_useJMOLColors = true;
        rotate3D.styles.backgroundColor = '#E4FFC2';
        // width of the bonds for 2D depiction
        rotate3D.styles.bonds_width_2D = 1.5;
        // absolute saturation width of double and triple bond lines for 2D depiction
        rotate3D.styles.bonds_saturationWidthAbs_2D = 4.6;
        // the spacing of hashes for 2D depiction
        rotate3D.styles.bonds_hashSpacing_2D = 4.5;
        // atom text font size for 2D depiction
        rotate3D.styles.atoms_font_size_2D = 20;

        const molecule = ChemDoodle.readMOL(molBlock);
        if (!molecule) {
            throw new Error('Failed to parse MOL block into a molecule');
        }
        // Optionally scale molecule (adjust bond lengths for better visualization)
        molecule.scaleToAverageBondLength(50); // Default bond length scaling


        rotate3D.loadMolecule(molecule);
        rotate3D.startAnimation();

        // 暫存實例，供之後停止動畫用
        canvasInstanceRef.current = rotate3D;
    };

    // 每次 smiles、viewMode、renderTrigger 改變時，就先清除畫布，再重新初始化
    useEffect(() => {
        clearCanvas();
        initializeRDKitAndRender();
    }, [smiles, viewMode, renderTrigger]);

    return (
        <div className={styles.chemdoodleContainer}>
            <div className={styles.chemdoodleCard}>
                <header className={styles.chemdoodleHeader}>
                    <h2><b>Welcome to Chemical Structure Viewer</b></h2>
                </header>

                <div className={styles.inputContainer}>
                    <label htmlFor="smiles-input" className={styles.inputLabel}>
                        Enter SMILES String:
                    </label>
                    <input
                        id="smiles-input"
                        type="text"
                        value={smiles}
                        onChange={(e) => setSmiles(e.target.value)}
                        placeholder="e.g., CN=C=O"
                        className={styles.inputSmiles}
                    />

                    <label htmlFor="view-select" className={styles.inputLabel}>
                        Select View Mode:
                    </label>
                    <select
                        id="view-select"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className={styles.inputSelect}
                    >
                        <option value="2D">2D View</option>
                        {/* <option value="3D Dynamic">3D Dynamic</option> */}
                        <option value="3D Rotation">3D Rotation</option>
                    </select>

                    <button
                        onClick={() => setRenderTrigger((prev) => !prev)}
                        className={styles.renderButton}
                        aria-label="Render Chemical Structure"
                    >
                        Render
                    </button>
                </div>

                <div id="canvas-container" className={styles.canvasContainer}>
                    <canvas id="canvasId" aria-label="Chemical Structure Visualization"></canvas>
                </div>
            </div>
        </div>
    );
}
