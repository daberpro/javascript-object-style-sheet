const _eval = require("eval");
const beautify = require("js-beautify").js;
const GLOBAL_FUNCTION = require("./global_function");
const a = `
number width = 100/2;

class .orang = {
    pixel width: 100;
    pixel height: 100;
    
}

number height = 100;

class .makan = {
     pixel a : 0;

     .child:{
       string nama: "daber";

         .color:{
           color: "white";
         },
     },
}


class .buah = {
    a: 0;
}

class .header = {
    pixel width: 100;
    pixel height: 100;

    .haiya:{
        .ari:{
            .ganteng:{
                pixel top: 100;
            },
        },
    },

    .google: {
        width : 100;

        .button:{
          width: "100px";
        },
    },

    .facebook:{
        .solid:{
           .navbar:{
               width: 100%;

               .menu:{
                 color: "red";
               }
           }
           color: red;
        },
        width : 100;
        height: 400;
        background: red;

    },
}

class .navbar = {
    string color : "white"; 
    pixel width : 100;
    width: 200;

    .umur : {
        .ari: {
            .ganteng:{
                pixel top: 100;

                .makan: {
                     pixel a : 0;

                     .child:{
                       nama: "daber";

                       .link:{
                         width: 100%;

                         &hover:{
                           color: red;
                         },
                       },
                     },
                },
            },
            width : 100;
            height: 400;
            background: red;
        },
    },
}

`;

const {
    ['log']: c
} = console;
// Make an object a string that evaluates to an equivalent object
//  Note that eval() seems tricky and sometimes you have to do
//  something like eval("a = " + yourString), then use the value
//  of a.
//
//  Also this leaves extra commas after everything, but JavaScript
//  ignores them.
function convertToText(obj) {
    // create an array that will later be joined into a string.
    const string = [];

    // is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (typeof(obj) == "object" && (obj.join == undefined)) {
        string.push("{");
        for (const prop in obj) {
            string.push(prop, ": ", convertToText(obj[prop]), ",");
        }
        string.push("}");

        // is array
    } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
        string.push("[");
        for (const prop in obj) {
            string.push(convertToText(obj[prop]), ",");
        }
        string.push("]");

        // is function
    } else if (typeof(obj) == "function") {
        string.push(obj.toString());

        // all other values can be done with JSON.stringify
    } else {
        string.push(JSON.stringify(obj));
    }

    return string.join("");
}

// fungsi ini akan berisi class class yang di deklarasikan
function getClass() {
    const data = a.split(/\s*\n/);
    // variabel ini adalah varibael yang menampung banyak nya jumlah class
    const ClassData = [];
    // variabel ini berisi index dari setiap lokasi string dari setiap value dari data
    let ClassDeclaration = [];
    // ini untuk jumlah class
    let count = 0;
    // variabel ini berisi class class yang telah di ambil
    const revition = [];
    // variabel ini akan berisi string nama class
    const class_name = [];

    for (let x = 0; x < data.length; x++) {
        // mengecek setiap value dari array data yang terdapat string class
        if (data[x].match(/\w*class/) && data[x].match(/\w*{/)) {
            count++;
            ClassData.push(count);
            // di sini mengambil nama kelas
            class_name.push(data[x]);
            ClassDeclaration.push({
                // memasukan lokasi awal string class
                [count]: x,
            });
        } else if (data[x].match(/\w*}/)) {
            // memasukan lokasi akhir string } dari setiap class
            ClassDeclaration.push({
                [count]: x,
            });
        }
    }

    // kita urutkan semua index class nya dari yang terkecil ke yang terbesar
    ClassDeclaration = ClassDeclaration.sort((a, b) => {
        return a - b;
    });

    // kita ambil kelas dari si variabel data berdasarkam index dari ClassData
    for (let x = 0; x < ClassDeclaration.length - 1; x++) {
        for (const y of ClassData) {
            if (ClassDeclaration[x][y]) {
                const clear_class = data.slice(ClassDeclaration[x][y], ClassDeclaration[x + 1][y] + 1);
                const class_property = data.slice(ClassDeclaration[x][y] + 1, ClassDeclaration[x + 1][y]);
                if (clear_class.length > 0) {
                    revition.push(clear_class);
                }
            }
        }
    }

    // variabel ini akan menampung class class yang telah di ambil dan akan
    // di jadikan array
    let class_rev = "";

    // kita ambil setiap class dari variabel revition dan memisahkan setiap class
    for (let i = 0; i < revition.length; i++) {
        if (revition[i].join(" ").match(/\w*[},]/igm).length > 2) {
            revition[i] = [revition[i].join(" ").replace("}", " ")];
        }

        if (revition[i].join(" ").match(/\w*class/igm)) {
            class_rev += "$" + revition[i].join(" ");
        } else {
            class_rev += revition[i].join(" ");
        }
    }

    // kita gunakan js beauty agar sintaks nya lebih rapi
    const class_prop = beautify(class_rev, {
        indent_size: 2,
        space_in_empty_paren: true,
    });

    // kita kembalikan class yang telah di olah dan di jadiin array
    return [class_prop.split("$"), class_name.join("").replace(/\w*{/igm, "\n").replace(/\w*class|=/igm, "").split("\n")];
}

// fungsi ini untuk mengambil property class
function getClassAtribute(ClassM, ClassName) {
    // di sini nama kelasnya di ambil
    const ClassesName = ClassName;
    // kita ambil class nya
    // dan di jadiin array setiap string nya
    const class_dec = ClassM.replace(/\;/igm, ";\n").split("\n");
    // kita ambil lokasi index dari string :,{,}
    let count_of_class_prop = 0;
    // kita masukan index dari :,{,} dengan di jadiin object
    const prop = [];
    // kita masukan jumlah index nya
    const prop_count = [];

    //di sini nama class yang udah di olah
    let CLASS_NAME = "";

    // console.log(class_dec.join("").match(/\w*class/))

    // kita lakukan filter untuk mengambil index dari property nya
    for (let i = 0; i < class_dec.length; i++) {

        if (class_dec[i].match(/\w*:/) && class_dec[i].match(/\w*{/) || class_dec[i].match(/\w*:/)) {
            count_of_class_prop++;
            prop_count.push(count_of_class_prop);
            if (class_dec[i].match(/\w*:/) && class_dec[i].match(/\w*{/) && !class_dec[i].match(/\w*;/)) {

                class_dec[i] = CLASS_NAME.replace(/\s*/igm, "") + " " + class_dec[i].replace(/\s*/igm, "");
            }
            prop.push({
                [count_of_class_prop]: i,
            });
        } else if (class_dec[i].match(/\w*},/)) {
            prop.push({
                [count_of_class_prop]: i,
            });
        }

        if (class_dec[i].match(/\w*class/igm)) {
            CLASS_NAME = class_dec[i].replace(/\w*{/igm, "").replace(/\w*class|=/igm, "");
        }
    }

    // di sini semua property di masukan
    const all_prop = [];

    for (let x = 0; x < prop_count.length; x++) {
        for (let y = 0; y < prop.length; y++) {
            if (prop[y][prop_count[x]]) {
                all_prop.push(prop[y][prop_count[x]]);
                // console.log(class_dec[prop[y][prop_count[x]]])
            }
        }
    }

    // di sini kita ambil property class nya dan di jadiin array
    const clear = class_dec.slice(all_prop[0], all_prop[all_prop.length - 1] + 1).join("\n").split("\n");
    // kita gunakan js beauty agar sintaks nya lebih rapi
    return beautify(clear.join("").replace(/\w*,/igm, "\t").replace(/\;/igm, ";\n").replace(/\w*=/igm, ":").replace(/}/g, "}\n"), {
        indent_size: 2,
        space_in_empty_paren: true,
    })


}

let [CLASS_CLASIFICATION_FROM_JSS, CLASS_NAME_FROM_JSS] = getClass();
CLASS_NAME_FROM_JSS = CLASS_NAME_FROM_JSS.slice(0, CLASS_NAME_FROM_JSS.length - 1);

for (let x in CLASS_NAME_FROM_JSS) {
    CLASS_NAME_FROM_JSS[x] = CLASS_NAME_FROM_JSS[x].replace(/\s+/igm, "")
}
let SUBCLASS_FILTERED = [];
let JSS_CLASSES = [{
    attribute: null,
    list: "close-tag",
    id: 0
}];
let list = 0;
//mengambil setiap class
for (let x of CLASS_CLASIFICATION_FROM_JSS) {
    let attribute = getClassAtribute(x).split("\n");
    for (let a = 0; a < attribute.length; a++) {
        // log(attribute[a]);
        if (attribute[a].match(/\w*:/igm) && attribute[a].match(/\w*{/igm)) {
            list++;
            JSS_CLASSES.push({
                attribute: attribute[a],
                list: "open-tag",
                id: list,
            })
        } else if (attribute[a].match(/\w*}/)) {
            JSS_CLASSES.push({
                attribute: attribute[a],
                list: "close-tag",
                id: 0
            })
        }
    }

}


let parentClassName = [];
let classChild = [];
let COUNT_CLASS = 0;

// log(JSS_CLASSES)

for (let x = 1; x < JSS_CLASSES.length - 1; x++) {
    if (typeof JSS_CLASSES[x].list === "string") {
        
        if ((JSS_CLASSES[x].id < JSS_CLASSES[x + 1].id || JSS_CLASSES[x].id > JSS_CLASSES[x + 1].id) &&
            !JSS_CLASSES[x].attribute.match(/\w*}/) && JSS_CLASSES[x - 1].id !== 0) {

            classChild.push({
                status: "child",
                data: JSS_CLASSES[x].attribute,
                parent: null,
                parentChild: null,
                id: JSS_CLASSES[x].id,
                pos: JSS_CLASSES[x - 1].attribute.replace(/\s /igm, "0").replace(/}/g, "").match(/\d*0/igm).join("").length
            });

            parentClassName.push({
                pos:COUNT_CLASS,
                status: (JSS_CLASSES[x - 1].attribute.replace(/\s /igm, "0").replace(/}/g, "").match(/\d*0/igm).join("").length <= 2 | 1 && JSS_CLASSES[x - 2].id == 0) ? "parent" : "child",
                data: JSS_CLASSES[x - 1].attribute.replace(/}/g, "").replace(/\s+/igm, ""),
                location: JSS_CLASSES[x - 1].attribute.replace(/\s /igm, "0").replace(/}/g, "").match(/\d*0/igm).join("").length
            });


        } else {
            classChild.push({
                status: "child",
                data: JSS_CLASSES[x].attribute,
                parent: null,
                uuid: COUNT_CLASS,
                id: JSS_CLASSES[x].id,
                pos: null
            });
        }

    }
}

let pc = "";
let Class_Mix = [];

for (let x of classChild) {
    for (let z of parentClassName) {
        if (z.status === "parent") {
            pc = z.data.replace(/:{/igm, "");
            if (z.data.match(x.data.replace(/\s+/igm, "").match(/\.*[^\w]*\w+/))) {
                Class_Mix.push(z);
                Class_Mix = [...new Set(Class_Mix)];
            }
        }
    }

}

let d = [];

for (let x of classChild) {
    for (let y of CLASS_NAME_FROM_JSS) {
        // c(y);
        if (x.data.match(y)) {
            d.push(y);
            d = [...new Set(d)];
        }
    }
}


for(let x in classChild){
    for(let a of Class_Mix){
        if(classChild[x].data.replace(/\s+/igm,"").match(a.data)){
          classChild[x].data = a.data; 
          classChild[x].pos = 0;
        }
    }
}
// c(classChild[0].data.replace(/\s+/igm,""))
// c(Class_Mix[0].data)

function ClassChildFilter(parent, child) {

    let check = [], data = [];

    for (let x of child) { 
        for (let y of d) {
            if ((x.data.match(/\.*\w*\w/))) {
                if ((x.data.match(/\.*\w*\w/))[0].match(y)) {
                    check.push(x);
                    x.parent = y;
                    check = [...new Set(check)];
                }
            }
        }
    }

    for(let h = 0; h < check.length-1; h++){
        if((check[h].pos === 0 || check[h+1].pos > 0) && check[h+1].pos !== 0){
            c(check[h]);
        }
    }

    for (let a of parent) {
      for(let b of check){
        if(a.data.match(b.parent)){
           data.push(b.data.replace(/\.*\w*\w/,a.data.replace(/:*[${]/,"")).replace(/:*/igm,""));
          data = [...new Set(data)];
        }
      }
    }

    // c(check);
    // c(child);

    // check.forEach((i)=>{
    //     c(i.data);
    // });

}

ClassChildFilter(Class_Mix, classChild);
// c(classChild)
// c(Class_Mix)
// c(CLASS_NAME_FROM_JSS)
