

 import levenshtein from 'fast-levenshtein';

 import fuzzysort from 'fuzzysort';
 import druglist from './druglist';
 import nspell from "nspell";
 import scan from './scan';



import { checkSynonyms, GenPrev } from './funcs';


  
        let columns=[];
        let selectedSht=[]

        let column1=false;
        let column2=false
        const allData=[]
        let Col1='';
        let sheetN1='';
         let Col2='';
        let sheetN2='';
        let indexNum1=0;
         let indexNum2=0;
        let colIndex1;
        let colIndex2;

        let simPercent;
  let spni=document.querySelector("#loadingSpinner")


  //facade InFile Button
  document.querySelector("#fakeIn").addEventListener("click",()=>{
    document.querySelector("#file").click()
  })


        const Infile=document.querySelector("#file");

        Infile.addEventListener("change",(e)=>{
         //show spinner on change
        spni .classList.remove("d-none")
        // hide FIleDiv
        document.querySelector("#FileDiv").classList.add("d-none")

        
              setTimeout(() => {
                  const file=e.target.files[0];
                if (file) {
                    
                    const reader=new FileReader();
                    reader.onload=function(e){
                       //Hide spinner on Read
         spni.classList.add("d-none")
                            const data=new Uint8Array(e.target.result);
                            const workBook=XLSX.read(data,{type:'array'});
                           // console.log(workBook)
                           
                         getSheetNames(workBook)
                         setCol()
                      
                    }

                    reader.readAsArrayBuffer(file)
                }

              
              }, 10); // Let browser render the spinner before running the loop
        })


        function getSheetNames(workBook) {
            const hold=[];
           
            const SheetNames=workBook.SheetNames;
             
            SheetNames.map((Shname,i)=>{
               const sheet=workBook.Sheets[Shname];
               const jsonData=XLSX.utils.sheet_to_json(sheet,{header:1})
            
               if (jsonData[0]!==undefined && jsonData[0]!==null) {

                const df={
                    name:SheetNames[i],
                    data:jsonData,
                }
               
                const obj={
                   name:SheetNames[i],
                   columns:jsonData[0].length,
                   'colName':jsonData[0]
                }
            
                hold.push(obj)
              allData.push(df);
           
               }
            })
hold.map((val,i)=>{

    const colN=val['colName'].toString();
      columns.push(val)
const temp=`   <div class="col-md-4 mb-4" >
     <div class="card h-100 shadow-sm border-primary" id="st${i}">
        <div class="card-body text-center" >
          <h5 class="card-title">${val['name']}</h5>
          <p class="text-muted">${val['columns']} columns</p>
          <button class="btn btn-outline-primary colBtn" pap="${colN}" cName="${val['name']}" index="${i}">
            Select Sheet
          </button>
          
        </div>
      </div>
      
   </div>`;

   document.querySelector("#sheetCards").innerHTML +=temp;
      

})




        }
        

        function setCol(params) {
            const cols=document.querySelectorAll(".colBtn");
            
            
            cols.forEach(ele => {
              ele.addEventListener('click',()=>{
                const chosenindex=ele.getAttribute("index");
                if (column1) {
                  column2=true
                  indexNum2=chosenindex
                }else{
                  column1=true;
                  indexNum1=chosenindex
                }

                document.querySelector("#selectedSheetName").innerHTML=ele.getAttribute("cName")
                document.querySelector("#columnSection").classList.remove("d-none")
                document.querySelector("#columnDropdown").innerHTML=""
                 const attr=ele.getAttribute('pap').split(',');
                
                 
                 document.querySelector(".hldInd").setAttribute("ind",chosenindex)
                attr.map((val,i)=>{
                     const temp=`
               <option value="${val}" class="options">${val}</option>
               ` 
               document.querySelector("#columnDropdown").innerHTML+=temp;
                })
              
              })
            });
            //gnb()
        }

        
 function displ(){
  //  const{a,b}=allData

let gn;let tj='';

if (column1 && !column2) {

  tj=Col1
  gn=allData[indexNum1]['data']
   colIndex1=gn[0].indexOf(tj)
}

if (column2) {
  tj=Col2
  gn=allData[indexNum2]['data']
 colIndex2=gn[0].indexOf(tj)
}

;

const indf=gn[0].indexOf(tj)




   const tmpDiv=document.createElement("div");
      const tmpP=document.createElement("h4");
      tmpDiv.className="col"
   tmpP.innerHTML=tj;
   tmpP.className="border-bottom text-primary"

   tmpDiv.appendChild(tmpP)
 
   document.querySelector(".hd").appendChild(tmpDiv)


gn.shift()


 gn.slice(0,50).forEach((ele,i) => {
   let tmpHd=document.createElement("p");
  tmpHd.className="border-bottom fs-6"
   tmpHd.innerHTML=ele[indf];

  tmpDiv.appendChild(tmpHd)
}); 


if (column1 && column2) {
  document.querySelector(".ml").classList.remove("d-none")
}

}








// handle alert for confirm column select
       document.querySelector(".cc").addEventListener('click',()=>{
       const chosenCol=document.querySelector("#columnDropdown").value;
          const chosenSht=document.querySelector("#selectedSheetName").innerHTML;
       
       let yest = confirm(`You selected column: ${chosenCol} from sheet: ${chosenSht}` )

         if (yest) {


          //closed column Selection Section on choose
          document.querySelector("#columnSection").classList.add("d-none")

          
        
         if (column2) {
          document.querySelector(".col2").innerHTML=chosenCol;
           Col2=chosenCol;
         sheetN2=chosenSht;
          columns.map((eve)=>{    
         if (eve['name']==chosenSht) {
            let dc=eve['colName']
             let f2=dc.indexOf(Col2);
            dc.splice((f2+1),0,`Corrected ${Col2}`)
          selectedSht.push(dc);
         }
         })
     
         }else{
           document.querySelector(".col1").innerHTML=chosenCol;
            Col1=chosenCol;
            sheetN1=chosenSht;
          columns.map((eve)=>{    
         if (eve['name']==chosenSht) {
            let dc=eve['colName']
             let f1=dc.indexOf(Col1);
            dc.splice((f1+1),0,`Corrected ${Col1}`)
          selectedSht.push(dc);
         }
         })

         }

          

         //disable select button and show similarity modal and call simP()
         if (column1== true && column2==true) {
          document.querySelector(".cc").disabled=true
          document.querySelector(".moda").classList.remove("d-none")

          simP()
         }

        document.querySelector(".prevCol").innerHTML=chosenCol
         
        let hldInd= document.querySelector(".hldInd").getAttribute("ind");
        const mgcls="#st"+hldInd;
      
       document.querySelector(mgcls).classList.add("dactive")
          displ()
      
         }


       
    })

//check
document.querySelector("#check").addEventListener('click',()=>{

  rtf()
});



function rtf() {


   let ty=[];
  const spin = document.querySelector("#spin");
  spin.classList.remove("d-none");

    let gn1 = allData[indexNum1]['data'];
 
    let gn2 = allData[indexNum2]['data'];


    let td2=  gn2.map(ele =>{
      const tg=ele[colIndex2];
      return tg
    });

  setTimeout(() => {
    const srt = new Set();
    selectedSht.forEach((e) => {
     
      e.forEach((v) => {
        srt.add(v);
      });
    });

    let arr = Array.from(srt);
    arr.push('similarity');
    arr.push('checking')

    let exportData = [];
  
  let td1= gn1.map(ele=>{
   const tg= checkSynonyms(ele[colIndex1])
    return tg
  });

  
    function getForm(str) {
      const match = str.toLowerCase().match(/\b(tablet|injection|capsule|syrup|cream)\b/i);
      return match ? match[0] : null;
    }
const svo=new Set(td2);


    td1.forEach((val,i)=>{

      const dicText = `${td2.length}\n${td2.join("\n")}`;
const affText = `SET UTF-8\nTRY:abcdefghijklmnopqrstuvwxyz`;
const spell = nspell(affText, dicText);


if (svo.has(val.trim())) {
}else {

 const results = fuzzysort.go(val, td2);
        if (results.total !==0 && (results[0]['_score'] >-100) ) {
          td1[i]=results[0].target

        }else if (!spell.correct(val)) {
           const suggestions = spell.suggest(val);
           td1[i]=suggestions.length ? suggestions[0]: val
    
      }
    }
    })




     td1.forEach((val1, i1) => {
      const match=td2.indexOf(val1)
       if (match !==-1) {
           let bm1=gn1[i1].map(r=>r);
           let bm2=gn2[match].map(r=>r)
        bm1.splice((colIndex1+1),0,td1[i1])
bm2.splice((colIndex2+1),0,td2[match])


        ty=bm1.concat(bm2);
    
   
        ty.push('100%');
        ty.push(true);

           let exObj = {};
        arr.forEach((key, i) => {
          exObj[key] = ty[i];
        });
        exportData.push(exObj);  

      }else{
           let rawV1 = val1?.toString() || '';
      let v1 = rawV1;
      let form1 = getForm(rawV1);

      let bestMatchIndex = -1;
      let highestSimilarity = 0;

      td2.forEach((val2, i2) => {
        let rawV2 = val2?.toString() || '';
        let v2 =rawV2;
        let form2 = getForm(rawV2);

        if (form1 && form2 && form1 !== form2) return;

        const distance = levenshtein.get(v1, v2);
        const maxLen = Math.max(v1.length, v2.length) || 1;
        const similarity = 1 - (distance / maxLen);

        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatchIndex = i2;
        }
      });

      if ((highestSimilarity * 100) >= simPercent && bestMatchIndex !== -1) {
       let bm2=gn2[bestMatchIndex].map(r=>r)
        bm2.splice((colIndex2+1),0,td2[bestMatchIndex])


        
       let bm1=gn1[i1].map(r=>r);
        bm1.splice((colIndex1+1),0,td1[i1])


        ty=bm1.concat(bm2);
        
   
        ty.push((highestSimilarity * 100).toFixed(2)+"%");
        ty.push(true)

      

         let exObj = {};
        arr.forEach((key, i) => {
          exObj[key] = ty[i];
        });
        exportData.push(exObj);  
      } 
      } 
    }); 
  
  GenPrev(arr,exportData,Col1,Col2)


  }, 1); // Let browser render the spinner before running the loop
}


// choose similarity percentage

function simP(){
  let simBtn=document.querySelector("#simBtn");
  simBtn.addEventListener("click",()=>{
    let simInput=document.querySelector("#simInput");
    simPercent=simInput.value;

       document.querySelector(".moda").classList.add("d-none")
 
  })
}

