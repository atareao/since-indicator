## Webcam Manager for GNOME Shell

With this extension you can enable or disable the webcam from GNOME Shell.

### How it works

This extension unloads the module `uvcvideo` from the Linux Kernel. **Simple and easy**.

### Installation

In order to Webcam-manager works you need to edit `/etc/sudoers/`. You have to add the following line, if you want that webcam-manager works only for your user,

```
yourusername ALL=:NOPASSWD /sbin/modprobe -av uvcvideo, /sbin/modprobe -rv uvcvideo
```

If you want that this extension of GNOME Shell works for everybody on your PC, you have to add the following line,

```
ALL ALL=:NOPASSWD /sbin/modprobe -av uvcvideo, /sbin/modprobe -rv uvcvideo
```

Remember you must add this line using **sudo visudo**

After that install the extension from [GNOME Shell extensions](https://extensions.gnome.org/)

### Configuration

You can watch if the module `uvcvideo` is loaded in the Kernel. To do that, open the configuration and set option *Watch the webcam* to `true` and the `Watch time` to a positive value.

After that if someone enables the module `uvcvideo` the **indicator** will change the icon.

### Use it

The use of this extension to manage the webcam is very easy. Once it was installed and configurated following the previous steps, you can enable or disable the webcam by unload or load the `uvcvideo` module in the Linux Kernel.

More info [https://www.atareao.es](https://www.atareao.es)