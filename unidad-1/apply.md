# Unidad 1

## 🛠 Fase: Apply

### Select 

[http://www.generative-gestaltung.de/2/sketches/?01_P/P_1_2_3_04] 

### Describe

Se pueden observar figuaras recatgulares, cuadradas y verticales e una esacille de grilla horizontal. Tambien se observa un fondo negro que de alguna forma difumina la base superior de las figuras. Cada figura tiene una posicion especifica en la grilla, un tamaño y color prestablecido. Al darle click esta disposicion de las figuras como su tamaño y color cambia. Sin emabrgo la grilla horizontal se mantiene. Se observa de igual manera espacias en negro donde no se colocan figuras. 

### Analyze 

Lo que podria estar haciendo el programa por detras es setear un background en negro, y con alguna funcion difumina la parte de arriba, tiene una funcion poara crear las formas rectangulares de foma randomizada en tamaño y en la posicion en X, mientras que la posicion en Y es fija pero variable segun el height del canvas. El color tambien es randomizado, y todo esto cmabia con la funcion MousePressed. 

### Recreate

[https://editor.p5js.org/simonburgosb/sketches/kQUpGOm0l]

El programa genera una composición visual de rectángulos aleatorios organizados verticalmente. Cada vez que se ejecuta (o se hace clic con el mouse), se genera una nueva serie de "filas" (dispuestas verticalmente) que contienen múltiples rectángulos con características visuales aleatorias. Todo con el objetivo de crear una pieza unica visual y que recree el ejemplo original. 

### Explore 
[https://editor.p5js.org/simonburgosb/sketches/SR8QW5SSk]

Aqui lo que hice fue cambiar la orientacion de horizontal (como estaba antes) a una orientacion vertical, y defini una transparencia unica. Esto con el obetivo de cambiar la dispocion visual sin mutar radicalmente el proyecto. 

### Tinker
[https://editor.p5js.org/simonburgosb/sketches/h0CQPLdKK]

Añadí rotate(random(TWO_PI)) dentro de un push()/pop() para que cada rectángulo esté en un ángulo aleatorio.
Por qué: Esto "mutó" radicalmente el comportamiento visual original, que era ordenado y vertical. Ahora los rectángulos se ven desordenados, rotados y más expresivos, pero el código principal sigue intacto.
