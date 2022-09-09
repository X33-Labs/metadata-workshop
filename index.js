const pkg =  require('json-schema-library');
const fs = require('fs');
const xrpl = require("xrpl");
const path = require('path');
const { Draft07, JSONError } = pkg;
const fetch = require('node-fetch');
var metadata_folder_name = 'metafiles';
var schema_file = 'schema.json';




function main() {

    const directoryPath = path.join(__dirname, metadata_folder_name);
    fs.readdir(
        path.resolve(__dirname, metadata_folder_name),
        (err, files) => {
          if (err) throw err;
          
          files.map(function(x) {   
             if(x != schema_file)
             {
                parser( directoryPath + "\\" + x, directoryPath + "\\" + schema_file );
             }
          })
        }
      );

      return;
    
}

 function parser( inputFile, schemaFile ) {

    let input = readJsonFile(inputFile);
    let schema = readJsonFile(schemaFile);;

    const jsonSchema = new Draft07(schema);
    const errors = jsonSchema.validate(input);
    if(errors.length == 0)
    {
        console.info(`[INFO] Valid for file:` + inputFile);
    } else {
        console.error(`[ERROR] input not valid for file:` + inputFile);
        errors.map(x => console.log(x));
    }
}

function readJsonFile(file) {
    let raw = fs.readFileSync(file);
    return JSON.parse(raw);
}

async function bonus()
{
    const directoryPath = path.join(__dirname, metadata_folder_name);
    const client = new xrpl.Client('wss://xls20-sandbox.rippletest.net:51233');
    await client.connect();
    const response = await client.request({
        "command": "account_nfts",
        "account": "rJHiogxxsCxjQxndVYT8YNsumApzTCKrdH",
        "ledger_index": "validated"
      });
    if (response.result.account_nfts.length > 0)
    {
        response.result.account_nfts.map(function(x){
            let decodedUri = xrpl.convertHexToString(x.URI)
            if(decodedUri.startsWith('https://ipfs.io'))
            {
                fetch(decodedUri).then((r)=>{r.text().then((fetchedTxt)=>{
                    let metadata = fetchedTxt;
                    console.log(metadata, directoryPath, schema_file)
                    const jsonSchema = new Draft07(readJsonFile(directoryPath + "\\" + schema_file));
                    const errors = jsonSchema.validate(metadata);
                    if(errors.length == 0)
                    {
                        console.info(`[INFO] Valid for NFTTokenID:` + x.NFTokenID);
                    } else {
                        console.error(`[ERROR] input not valid for NFTTokenID:` + x.NFTokenID);
                        errors.map(x => console.log(x));
                    }
                })})
            }
        })
    }
    await client.disconnect();

}


bonus();