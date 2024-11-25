// "use client"
'use client';
// 測試好聊天塊 裡要顯示的 Canvas 互動  接收{ title, smiles } 
// 做好之後，一去 smile-plot 裡面
import { useEffect } from 'react';

export default function ChemDoodleComponent() {
    const mol = 'H2O\n  CHEMDOOD12280913053D\n\n  3  2  0     0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.0000    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000    1.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\nM  END\n';

    useEffect(() => {
        if (typeof ChemDoodle !== 'undefined') {
            // 在這裡使用 ChemDoodle

            const transformBallAndStick = new ChemDoodle.TransformCanvas3D(
                "canvasId",
                300,
                300
            );
            transformBallAndStick.styles.set3DRepresentation("Ball and Stick");
            transformBallAndStick.styles.backgroundColor = "black";

            const molecule = ChemDoodle.readMOL(mol, 1);
            transformBallAndStick.loadMolecule(molecule);


        } else {
            console.error('ChemDoodle 未正確載入');
        }
    }, []);

    return <canvas id="canvasId"></canvas>;
}

