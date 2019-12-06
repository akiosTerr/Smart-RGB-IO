class RGBobj {
    constructor(r, g, b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }
    set_values(rgba) {
        this.red = rgba[0];
        this.green = rgba[1];
        this.blue = rgba[2];
    }
    get_values() {
        let rgb = [this.red, this.green, this.blue];
        return rgb;
    }
}

class Pallets {
    current_obj = null;
    cur_plt = null;
    elements = {
        parent: document.getElementById("pallet_array"),
        plt1: document.getElementById("pallet1"),
        plt2: document.getElementById("pallet2"),
        plt3: document.getElementById("pallet3"),
        list: function () {
            return [plt1, plt2, plt3]
        },
    };
    constructor() {

    }

    list() {
        let arr = Pallets.elements.list();
        for (let i = 0; i < arr.length; i++) {
            const element = array[i];
            console.log(element);
        }
    }
    highlight(a) {
        this.plt_list.forEach(element => {
            if (element == plt_list[a]) {
                element.style.opacity = 1;
            } else {
                element.style.opacity = 0.5;
            }
        });
    }
}

module.exports = {
    RGBobj,
    Pallets,
};