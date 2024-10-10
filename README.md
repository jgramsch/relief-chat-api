# Postulación a relif - chat api

## Uso

### Api

La api se encuentra expuesta en http://relif.josemgramscha.cl/... y puede ser accedida a través de los comandos en curl especificados en el enunciado pero reemplazando el url, similarmente se habilita un espacio en postman para testear las llamadas a los evaluadores.

las rutas definidas son:

- POST `/client`
- POST `/clients/:id/message`
- GET `/clients`
- GET `/clients/:id`
- GET `/clients-to-do-follow-up`
- GET `/clients/:id/generateMessage`

### local

Teniendo docker y docker-compose instalados, solo hay que ir a la raíz del proyecto y correr el siguiente comando:

`docker-compose up --build`

## Modelo y prompting

### Modelo

Tras probar con varios modelos, el modelo de menor precio que mejor hace la tarea es gpt-4o-mini, esto sumado a respuestas concisas de baja temperatura y una tarea bien definida es capaz de llevar bien la tarea

### Prompt

Para hacer el prompt se asumieron datos de autos y tiendas las que tienen descripciones básicas y locaciones ficticias. Estos se incluyen en el prompt además de la información de deudas de los clientes (sin el monto), para diferenciar instrucciones de información se usan tags de estilo html. El prompt en si se encuentra en un archivo llamado `prompt.txt` en la carpeta `src/agent/` junto con el archivo `dummy_data.json`. El prompt final es generado en código para permitir cambio en la información. Hasta ahora no se implementó que cada ubicación tenga un catalogo especifico de autos por lo que se asumió que todos los autos estaban disponibles en todos lados. Las etiquetas usadas son "<<d>Debts>"

## Estructura del proyecto

### Contenedores

El código depende de el contenedor de postgress lanzado junto con este. Pero se puede ocupar para cualquier servidor de este estilo mientras se complete la configuración en el archivo .env.

Ahora mismo el código corre como la composición del contenedor de api y el de postgress. Esta composición corre como servicio en una máquina virtual en DigitalOcean. Desistí de ocupar google run ya que debía correr una base de datos acorde y su configuración limita mi tiempo.

### Módulos y entrada

El código está dividido en dos módulos: `database` y `agent` los cuales exportan instancias de clases que corresponden a los controladores en ambos casos. Finalmente `index.ts` define las rutas pedidas.

### Alcances

- Los modelos de database quedaron definidos en su controlador por tiempo. Esto en general debiese estar en otro archivo.
- Dado que los ruts son únicos quise incluirlo en la base de datos por lo que si se intenta agregar usuarios con el mismo string de rut la api regresa "internal server error", sin embargo esto no bota la api por lo que se pueden seguir haciendo requests. Falta capturar bien ese error para que el mensaje que se responde haga sentido.

### TO DO

- catch specific errors from database

- add debt post

- Add sale status to prompting

- Add stores and cars to a real database

- Asociate cars to stores

- Implement message trimming and summary
