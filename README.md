# TrabajoFinalIoT
trabajo final de la especialización en internet de las cosas

para correr en máquina anfitriona en windows es necesario tener instalado Node.js y ejecutar "cd ruta/al/frontend" y luego ejecutar "npm install --save-dev @angular-devkit/build-angular"

por la configuración actual, también es necesario entrar al backend mediante "docker exec -it node-backend bash" y allí instalar los paquetes necesarios mediante "npm install". Hasta ahora fueron necesarios npm install jsonwebtoken, npm install websocket.io, npm install bcrypt, npm install validator. Esto lo hace mediante una request POST al endpoint correspondiente. El último paso del arranque es realizar una request GET al enpoint de la API REST que devuelve la los registros de la tabla raciones filtrando por device_id.

Arranque de ESP32:
El ESP32 levanta su propio servidor y se dispone en modo AP (access point). La app debe tener una página que permita al usuario ingresar al ESP32 (que se encuentra en modo AP) las credenciales de la red Wifi doméstica y junto con estas envía el user_id que se encuentra guardado en la app (no se si en una cookie o de qué otra forma. Dame opciones simples). El ESP32 recibe todos esos datos y los almacena en su NVS. Usa las credenciales para conectarse a la red wifi doméstica y una vez conectado emite una request POST al backend para generar el registro en la tabla "dispositivos" y obtener el nuevo valor "device_id" recién creado (no se si esto puede saberse mediante la response. por favor confirmamelo o corregime). Luego debe guardar este device_id en su MVS. Después debe modificar el campo device_id en el registro  en la tabla "relaciones" asociado al user_id. 

Lógica comunicación APP-ESP32:
Una vez vinculado el ESP32 a la red wifi doméstica y conociendo el user_id y device_id correspondiente, debe poder recibir mensajes desde el backend cuando el usuario realice alguna de estas acciones desde la app: modificar raciones, enviar orden de expender alimento, desvincular alimentador. Planteo el ejemplo para el caso de expender alimento: 
1. el usuario hace click en un botón que dice "alimentar".
2. la app se comunica al backend para informar la acción realizada en el punto anterior. No se si lo mejor es usar websockets o enviar una request a un endpoint de la API REST. Decime que opción es más simple y/o apropiada en este caso.
3. El backend, luego de recibir este mensaje, envía un mensaje al ESP32 mediante websocket.
4. El ESP32 al recibir el mensaje ejecuta la función "alimentar" de su código.

Otro ejemplo es cuando el usuario modifica la tabla "raciones":
1. el usuario hace crea o elimina una ración mediante el frontend de la app .
2. la app envía una request POST al endpoint "crearRacion" o "eliminarRacion" de laAPI REST del backend para plasmar la acción del punto anterior.
3. El backend, luego de recibir este mensaje y modificar la tabla "raciones", envía un mensaje al ESP32 mediante websocket.
4. El ESP32 al recibir el mensaje ejecuta la función "updateRaciones" de su código, el cual realiza una request GET al endpoint "consultarRaciones" de la API REST de donde obtiene la información y actualiza los datos almacenados.