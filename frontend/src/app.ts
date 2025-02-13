npm install -g @ionic/cli
ionic start smart-feeder blank --type=angular

# Entrar en el proyecto
dcd smart-feeder

# Agregar Angular Material (opcional, si se usa Materialize no es necesario)
npm install @angular/material

# Agregar Chart.js para gráficos
npm install chart.js

# Configurar rutas en Angular
ng generate module app-routing --flat --module=app

# Crear componentes base
ng generate component pages/login
ng generate component pages/signup
ng generate component pages/home
ng generate component pages/user
ng generate component pages/animal
ng generate component pages/device

# Ejecutar en local para probar
ionic serve