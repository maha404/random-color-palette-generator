import React, { useState, useEffect } from 'react';
import rgbHex from 'rgb-hex';

export default function Palette() {
    const [paletteData, setPaletteData] = useState([]);
    const [copiedMsg, setCopiedMsg] = useState('');
    const [showCopiedMsg, setShowCopiedMsg] = useState(false);

    useEffect(() => {
        getPalette();
    }, []);

    async function getPalette() {
        const response = await fetch('http://colormind.io/api/', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({ model: "default" }),
        });
        const data = await response.json();
        setPaletteData(data.result);
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
        const hex = paletteData.map(color => `#${rgbHex(...color)}`);
        const hexcodes = hex.join();
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
                    const hexColor = `#${rgbHex(...paletteColor)}`;
                    return (
                        <div className='colorCard' key={index}>
                            <div className="colors" onClick={() => copyToClipboard(hexColor.toUpperCase())} style={{ backgroundColor: hexColor }}>
                            </div>
                            <p>{hexColor.toUpperCase()}</p>
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
