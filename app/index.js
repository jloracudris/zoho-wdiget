$(document).ready(function() {
  let crmData = [];  
  axios({ 
      method: 'GET', 
      url: 'http://172.16.15.119:9191/api/statement?pagesize=10', 
      headers: {"Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC8xNzIuMTYuMTUuMTE5OjkxOTFcL2FwaVwvYXV0aFwvbG9naW4iLCJpYXQiOjE1NDA0MzkxMjEsImV4cCI6MTU0MDQ0MjcyMSwibmJmIjoxNTQwNDM5MTIxLCJqdGkiOiJPNnVielQ5YUJIZjRCcmNuIiwic3ViIjoiMTExNTczNTgyMCIsInBydiI6IjEzZThkMDI4YjM5MWYzYjdiNjNmMjE5MzNkYmFkNDU4ZmYyMTA3MmUiLCJuYW1lIjoiSkVJQ0tTT04gRkFCSUFOIENSVVogUk9EUklHVUVaICIsImljZWJlcmdJZCI6IjEwMDA0ODQ1OCJ9.VEhUyXdO_bjt-muoA_cXtYLE6WbHvyqspaDmX5Cy-Yw"},
      responseType: 'text',
    }).then((response) =>{
      const datasource = xmlToJson($.parseXML(response.data));
      datasource.record.row.forEach(item => {        
        crmData.push(
          {
            "Recibo" : searchValueByName(item.FL, "No. Recibo")[0]["#text"],
            "Descripcion": searchValueByName(item.FL, "Descripción")[0]["#text"],
            "Estado": searchValueByName(item.FL, "Estado")[0]["#text"],
            "FechaVencimiento": searchValueByName(item.FL, "Fecha de Vencimiento")[0]["#text"],
            "ValorOriginal": searchValueByName(item.FL, "Valor Original")[0]["#text"],
            "Saldo": searchValueByName(item.FL, "Saldo")[0]["#text"],
            "Periodo": searchValueByName(item.FL, "Periodo")[0]["#text"],
          } 
        )
      });
      //datatable config

      let example = $('#example').DataTable( {
        data: crmData,
        "columns": [
          {
              data: function (row, type, set) {
                  return '';
              }
          },
          { data: "Recibo", title:  "Recibo"},
          { data: "Descripcion", title:  "Descripción"},
          { data: "Estado", title:  "Estado"},
          { data: "FechaVencimiento", title:  "Fecha Vencimiento"},
          { data: "ValorOriginal", title:  "Valor Original"},
          { data: "Saldo", title:  "Saldo"},
          { data: "Periodo", title:  "Periodo"},
          
        ],
        columnDefs: [ {
            orderable: false,
            className: 'select-checkbox',
            targets:   0
        } ],
        select: {
            style: 'multi',
            selector: 'td:first-child'
        },
        searching: false,
        dom: 'Bfrtip',
        buttons: [
            'selectAll',
            'selectNone'
        ],
        language: {
          buttons: {
              selectAll: "Select all items",
              selectNone: "Select none"
          }
        },
        order: [[ 0, 'desc' ]]
      } ); 
      
      const arrayOfCheckedElements = [];
      
      example.on( 'deselect', function ( e, dt, type, indexes ) {        
        const indexFromArray = arrayOfCheckedElements.indexOf(crmData[indexes]);
        if (indexFromArray !== -1) {
          arrayOfCheckedElements.splice(indexFromArray, 1);
          if(arrayOfCheckedElements.length === 0) {
            $("#button-wrapper").addClass("d-none");
          }
        }
        
      });
      example.on( 'select', function ( e, dt, type, indexes ) {        
        arrayOfCheckedElements.push(crmData[indexes])
        $("#button-wrapper").removeClass("d-none");
      });
    }).catch((error) => {
      console.log(error);
    })

  function searchValueByName(array, name) {
    const find = array.filter((element) => {
      return element["@attributes"].val == name
    });
    
    if (find.length > 0) {
      return find;
    }

    return null;
  }
  
});


function xmlToJson(xml) {	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};