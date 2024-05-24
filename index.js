// Funcție care face o cerere asincronă către API ul menționat pentru a obține un URL pentru o imagine aleatoare 
//cu câini. Funcția returnează obiectul JSON cerut.
async function fetchDogImage() {
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await response.json();
    return data.message;
}

// Funcție pentru a procesa imaginea în canvas
async function processImage() {
    const dogImage = await fetchDogImage();
    const canvas = document.getElementById('canvas');
    const mirrorCanvas = document.getElementById('mirrorCanvas');
    const edgeDetectionCanvas = document.getElementById('edgeDetectionCanvas');

    const context = canvas.getContext('2d');
    const mirrorContext = mirrorCanvas.getContext('2d');
    const edgeDetectionContext = edgeDetectionCanvas.getContext('2d');

    // Încarcă imaginea originală
    const image = new Image();//cream un obiect imagine
    image.src = dogImage;// îi setăm sursa cu imaginea de câine obținută anterior
    image.crossOrigin = "Anonymous";//evitarea erorilor de securitate
    await imageLoaded(image);//asteptam incarcarea completa

    // Afișează imaginea originală în canvas cu delay
    setTimeout(() => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }, 1000);

    // Procesare si desenare a imaginii în oglindă cu delay
    setTimeout(() => {
        mirrorContext.translate(mirrorCanvas.width, 0);
        mirrorContext.scale(-1, 1);
        mirrorContext.drawImage(image, 0, 0, mirrorCanvas.width, mirrorCanvas.height);
        mirrorContext.setTransform(1, 0, 0, 1, 0, 0);//resetarea transformarilor
    }, 2000);

    // Procesare imagine cu edge detection cu delay
    setTimeout(() => {
        //imageData conține informații despre fiecare pixel al imaginii, inclusiv valorile canalului de culoare (R, G, B, A).
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);//e obțin datele de imagine pentru canvas-ul original folosind getImageData
        const edgeDetectionData = edgeDetectionContext.createImageData(imageData.width, imageData.height);

        for (let y = 1; y < imageData.height - 1; y++) {
            for (let x = 1; x < imageData.width - 1; x++) {
                const i = (y * imageData.width + x) * 4;//indice pixel curent
                const gray = (//calculam valoare de gri care va inlocui intensitatile de culoareR,G,B
                    -imageData.data[i - imageData.width * 4 - 4] - 2 * imageData.data[i - 4] - imageData.data[i + imageData.width * 4 - 4]
                    + imageData.data[i - imageData.width * 4 + 4] + 2 * imageData.data[i + 4] + imageData.data[i + imageData.width * 4 + 4]
                ) / 8; //varianta simpificata a filtrului Sobel, care face o aproximare a gradientului imaginii si 
                //evidențiază regiunile de schimbare bruscă a intensității luminii (marginile)

                edgeDetectionData.data[i] = gray;  //R
                edgeDetectionData.data[i + 1] = gray; //G
                edgeDetectionData.data[i + 2] = gray;  //B
                edgeDetectionData.data[i + 3] = 255; // pentru imagine opacă
            }
        }

        edgeDetectionContext.putImageData(edgeDetectionData, 0, 0);
    }, 3000);
}
//4 etape se scade din de la sfarsit la inceput un 
// Funcție care returnează o promisiune pentru încărcarea imaginii
function imageLoaded(image) {
    return new Promise((resolve) => {
        image.onload = resolve;
    });
}