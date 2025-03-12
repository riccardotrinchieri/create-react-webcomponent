# create-react-webcomponent

Project starter for a **React** based webcomponent. <br>
If you are creating a component library in webcomponents **React** may not be a suitable choice, but if you are creating a widget that needs to be installed on other websites you can give it a try.

> **Note:** After the build, the **dist** folder will include an **html** file and **css** alongside the **min.js** file. Ignore all the files except the **min.js** that is where your webcomponent widget code lives. The other files are just for testing purposes.

## Getting started

Install the package globally

```
npm install --global create-react-webcomponent

//or

pnpm add -g create-react-webcomponent

//or use your package manager
```

Start your project

```
npx create-react-webcomponent

//or

pnpm create-react-webcomponent
```

## Description

This project starter will take care of the following problems:

- It provides a modified version of the **main.(jsx|tsx)** file so that the project is now a webcomponent and not a web app
- It provides a modified version of the **index.html** to test your web component locally
- It adds **Tailwind** to the project, in a way that your Tailwind classes won't break any of the classes of the host website
- It includes a simple **Rollup** plugin to the build that takes the minified code of the bundle and wraps it in a closure to avoid namespace collision with other minified JS bundles imported in the host website.

## What should be avoided

- Do not add any of your webcomponent styles to the **index.css**. That file is only meant to style the fake host page during the development process. Any style included in the **index.css** file will not be included in the final JS bundle.

## Templates Support

At the moment of writing, the only supported template is **React + TS + Tailwind** which is the template I would personally go for. I may include other templates on request.
