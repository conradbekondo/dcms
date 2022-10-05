import { config } from 'dotenv';
import { BrowserWindow, Menu, screen } from 'electron';
import { join } from 'path';
import { bootstrap } from './main';
config({
  path:
    process.env.NODE_ENV === 'development'
      ? join(process.cwd(), `.${process.env.NODE_ENV}.env`)
      : join(process.cwd(), 'resources', `.production.env`),
});

bootstrap().subscribe(([_, server]) => {
  const url = `http://localhost:${process.env.APP_PORT}`;
  const menu: Menu = new Menu();
  const mainWindow = new BrowserWindow({
    center: true,
    width: screen.getPrimaryDisplay().size.width,
    height: screen.getPrimaryDisplay().size.height,
    zoomToPageWidth: true,
  });
  mainWindow.setMenu(menu);
  mainWindow.setTitle(process.env.APP_NAME);
  mainWindow.loadURL(url);
  mainWindow.show();
  mainWindow.on('closed', () => {
    server.close();
  });
});
