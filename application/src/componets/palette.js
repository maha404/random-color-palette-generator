import React, { useState, useEffect } from 'react';
import rgbHex from 'rgb-hex';

export default function Palette() {
    const [paletteData, setPaletteData] = useState([]);
    const [copiedMsg, setCopiedMsg] = useState('');
    const [showCopiedMsg, setShowCopiedMsg] = useState(false);

    useEffect(() => {
        getPalette();
    }, []);

    let json_data = {
        "mode":"transformer", // transformer, diffusion or random
        "num_colors":5, // max 12, min 2
        "temperature":"1.2", // max 2.4, min 0
        "num_results":1, // only request one palette result
        "adjacency":[
            "0", "65", "45", "35", "65",
            "0", "35", "65", "45", "35",
            "0", "35", "35", "65", "35",
            "0", "35", "45", "35", "65",
            "0", "65", "35", "45", "0"
        ], // nxn adjacency matrix as a flat array of strings
        "palette":["-", "-", "-", "-", "-"], // locked colors as hex codes, or '-' if blank
        }

    async function getPalette() {
        try {
            const response = await fetch('https://api.huemint.com/color', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(json_data)
            });

            const text = await response.text();
            let data = JSON.parse(text);
            

            const paletteResult = data?.results?.[0]?.palette || data?.palette || [];
            console.log('Palette result:', paletteResult);
            setPaletteData(Array.isArray(paletteResult) ? paletteResult : []);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    function copyToClipboard(text, isFullPalette = false) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedMsg(isFullPalette ? 'Copied the full palette to clipboard!' : `Copied to clipboard: ${text}`);
                setShowCopiedMsg(true);
                setTimeout(() => {
                    setShowCopiedMsg(false);
                    setTimeout(() => setCopiedMsg(''), 500);
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                fallbackCopyToClipboard(text, isFullPalette);
            });
        } else {
            fallbackCopyToClipboard(text, isFullPalette);
        }
    }

    function fallbackCopyToClipboard(text, isFullPalette) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed'; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            setCopiedMsg(isFullPalette ? 'Copied the full palette to clipboard!' : `Copied to clipboard: ${text}`);
            setShowCopiedMsg(true);
            setTimeout(() => {
                setShowCopiedMsg(false);
                setTimeout(() => setCopiedMsg(''), 500);
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    function copyFullPalette() {
        const hexcodes = paletteData.join();
        copyToClipboard(hexcodes, true);
    }

    function handleKeyPress(event) {
        if (event.key === ' ' || event.keyCode === 32) {
            getPalette();
        } else if (event.key === 'c' || event.key === 'C') {
            copyFullPalette();
        }
    }

    onkeypress = handleKeyPress;

    return (
        <div className="App">
            <div className='textContainer'>
                {copiedMsg &&
                    <p className={`copiedMsg ${showCopiedMsg ? 'show' : ''}`}>{copiedMsg}</p>
                }
            </div>

            <div className='Container'>
                {paletteData.map((paletteColor, index) => {
                    return (
                        <div className='colorCard' key={index}>
                            <div className="colors" onClick={() => copyToClipboard(paletteColor.toUpperCase())} style={{ backgroundColor: paletteColor }}>
                            </div>
                            <p>{paletteColor.toUpperCase()}</p>
                        </div>
                    );
                })}
            </div>
            <div className='btnContainer'>
                <button onClick={getPalette}>Generate palette</button>
                <p className='text'>Or press spacebar to generate new palette</p>
                <p className='infoText'>Click to copy individual color &hearts; Press "C" to copy the palette</p>
            </div>
        </div>
    );
}
