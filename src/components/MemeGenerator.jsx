import React, { useState, useRef, useEffect } from 'react';
import './MemeGenerator.css';

const MemeGenerator = () => {
    const [image, setImage] = useState(null);
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const canvasRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);

    const handleImageUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const onFileChange = (e) => {
        handleImageUpload(e.target.files[0]);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match image
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw image
            ctx.drawImage(image, 0, 0);

            // Configure text styles
            const fontSize = canvas.width / 10;
            ctx.font = `${fontSize}px Impact`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fontSize / 8;
            ctx.textAlign = 'center';

            // Text Wrapping Function
            const wrapText = (text, x, y, maxWidth, lineHeight, baseline) => {
                const words = text.toUpperCase().split(' ');
                let line = '';
                let lineY = y;

                // Adjust starting Y for bottom text to account for multiple lines moving UP
                if (baseline === 'bottom') {
                    // Calculate total height first to shift up
                    const testLines = [];
                    let testLine = '';
                    for (let n = 0; n < words.length; n++) {
                        const testWord = words[n];
                        const metrics = ctx.measureText(testLine + testWord + ' ');
                        const testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            testLines.push(testLine);
                            testLine = testWord + ' ';
                        } else {
                            testLine += testWord + ' ';
                        }
                    }
                    testLines.push(testLine);
                    lineY -= (testLines.length - 1) * lineHeight;
                }

                ctx.textBaseline = baseline === 'bottom' ? 'bottom' : 'top';

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > maxWidth && n > 0) {
                        ctx.strokeText(line, x, lineY);
                        ctx.fillText(line, x, lineY);
                        line = words[n] + ' ';
                        lineY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.strokeText(line, x, lineY);
                ctx.fillText(line, x, lineY);
            };

            const maxWidth = canvas.width * 0.9;
            const lineHeight = fontSize * 1.2;

            // Draw Top Text
            wrapText(topText, canvas.width / 2, 10, maxWidth, lineHeight, 'top');

            // Draw Bottom Text
            wrapText(bottomText, canvas.width / 2, canvas.height - 10, maxWidth, lineHeight, 'bottom');
        }
    }, [image, topText, bottomText]);

    const handleDownload = () => {
        if (canvasRef.current && image) {
            const link = document.createElement('a');
            link.download = 'funny-meme.png';
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };

    const generateJoke = async () => {
        try {
            const response = await fetch('https://official-joke-api.appspot.com/random_joke');
            const data = await response.json();
            setTopText(data.setup);
            setBottomText(data.punchline);
        } catch (error) {
            console.error("Error fetching joke:", error);
            setTopText("Error fetching joke");
            setBottomText("Try again later");
        }
    };

    return (
        <div className="meme-generator-container">
            <h1 className="title">🤪 Funny Meme Generator 🤪</h1>

            <div className="controls">
                <div
                    className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <label>
                        {image ? "Change Photo" : "Drag & Drop or Click to Upload"}
                        <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
                    </label>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Top Text (e.g., WHEN YOU...)"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Bottom Text (e.g., ...DATASTORES)"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                    />
                </div>

                <div className="button-group">
                    <button className="generate-btn" onClick={generateJoke}>
                        Generate Random Joke 🃏
                    </button>
                    <button className="download-btn" onClick={handleDownload} disabled={!image}>
                        Download Meme 🤣
                    </button>
                </div>
            </div>

            <div className="canvas-container">
                {image ? (
                    <canvas ref={canvasRef} className="meme-canvas" />
                ) : (
                    <div className="placeholder">
                        <p>Upload an image to start making magic! ✨</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemeGenerator;
