import Gtk from "gi://Gtk?version=3.0";

export const RoundedAngleEnd = (place) => Widget.DrawingArea({
  class_name: "angle",
  setup: widget => {
    const ratio = 1;
    const r = widget.get_allocated_height();
    widget.set_size_request(ratio * r, r);
    widget.on("draw", (widget, cr) => {
      const context = widget.get_style_context();
      const border_color = context.get_property("border-color", Gtk.StateFlags.NORMAL);
      const border_width = context.get_border(Gtk.StateFlags.NORMAL).bottom;
      const r = widget.get_allocated_height();
      widget.set_size_request(ratio * r, r);
      switch (place) {
        case "topleft":
          cr.moveTo(0, 0);
          cr.curveTo(ratio * r / 2, 0, ratio * r / 2, r, ratio * r, r);
          cr.lineTo(ratio * r, 0);
          cr.closePath();
          cr.clip();
          Gtk.render_background(context, cr, 0, 0, r*ratio, r);
          cr.moveTo(0, 0);
          cr.curveTo(ratio * r / 2, 0, ratio * r / 2, r, ratio * r, r);
          cr.setLineWidth(border_width * 2);
          cr.setSourceRGBA(border_color.red, border_color.green, border_color.blue, border_color.alpha);
          cr.stroke();
          break;

        case "topright":
          cr.moveTo(ratio * r, 0);
          cr.curveTo(ratio * r / 2, 0, ratio * r / 2, r, 0, r);
          cr.lineTo(0, 0);
          cr.closePath();
          cr.clip();
          Gtk.render_background(context, cr, 0, 0, r*ratio, r);
          cr.moveTo(ratio * r, 0);
          cr.curveTo(ratio * r / 2, 0, ratio * r / 2, r, 0, r);
          cr.setLineWidth(border_width * 2);
          cr.setSourceRGBA(border_color.red, border_color.green, border_color.blue, border_color.alpha);
          cr.stroke();
          break;
      }

      // cr.setLineWidth(border_width);
      // cr.setSourceRGBA(border_color.red, border_color.green, border_color.blue, border_color.alpha);
    });
  }
});
