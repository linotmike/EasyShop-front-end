let templateBuilder = {};

class TemplateBuilder
{
    build(templateName, value, target, callback)
    {
        axios.get(`templates/${templateName}.html`)
            .then(response => {
                try
                {
                    const template = response.data;
                    const html = Mustache.render(template, value);
                    document.getElementById(target).innerHTML = html;

                    if(callback) callback();
                }
                catch(e)
                {
                    console.error("Erroe in templateBuilder",e);
                }
            })
    }

    clear(target) {
        const element = document.getElementById(target);
        if(element){
            element.innerHTML = "";
        }else{
            console.error("Target element not found");
        }
        // document.getElementById(target).innerHTML = "";
    }

    append(templateName, value, target)
    {
        axios.get(`templates/${templateName}.html`)
             .then(response => {
                 try
                 {
                     const template = response.data;
                     const html = Mustache.render(template, value);

                     const element = this.createElementFromHTML(html);
                     const parent = document.getElementById(target);
                     if(!parent){
                         console.error("Target element not found");
                         return;
                     }
                     parent.appendChild(element);

                     if(target == "errors")
                     {
                         setTimeout(() => {
                             parent.removeChild(element);
                         }, 3000);
                     }
                 }
                 catch(e)
                 {
                     console.log(e);
                 }
             })
    }

    createElementFromHTML(htmlString)
    {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();

        // Change this to div.childNodes to support multiple top-level nodes.
        return div.firstChild;
    }

}
templateBuilder = new TemplateBuilder();

// document.addEventListener('DOMContentLoaded', () => {
//     templateBuilder = new TemplateBuilder();

// });
