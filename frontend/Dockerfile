# --- Build Stage ---
FROM node:20-alpine as build

# set the working directory
WORKDIR /app

# copy package.json and package-lock.json (if available)
COPY package*.json ./

# install dependencies using npm
# use --no-optional and --omit=dev for a cleaner production install if needed,
# but for the build stage, devDependencies are often required (like vite/typescript)
RUN npm install

# copy the rest of the application code
COPY . .

# run the build script defined in package.json (vite build)
RUN npm run build

# --- Production Stage ---
# use a lightweight nginx image
FROM nginx:stable-alpine

# copy the built static files from the 'build' stage to nginx's web root directory
COPY --from=build /app/dist /usr/share/nginx/html

# copy the custom nginx configuration file
# we'll create this file next
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose port 5040 for the frontend
EXPOSE 5040

# the default nginx command runs nginx in the foreground, which is what we want
CMD ["nginx", "-g", "daemon off;"]