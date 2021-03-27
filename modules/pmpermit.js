const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

async function insert(id) {
    try {
        var insertdata = await MongoClient.connect(config.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
        await insertdata.db("pmpermit").collection("data").insertOne({ number: id, times: 1, permit: false })
        return "inserted"

    } catch (err) {
        return "insert_error"
    } finally {
        insertdata.close();
    }

}

async function updateviolant(id, timesvio) { // promise update times data

    try {
        var updatewrite = await MongoClient.connect(config.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })

        await updatewrite.db("pmpermit").collection("data").updateOne({ number: id }, { $set: { times: timesvio } })
        return "updated"

    } catch (err) {
        return "update_error"
    } finally {
        updatewrite.close();
    }
}

async function readdb(id) { //Promise read data

    try {
        var mongoread = await MongoClient.connect(config.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })

        var result = await mongoread.db("pmpermit").collection("data").find({ number: id }).toArray()
        if (result[0] == undefined) {
            return ({
                status: "not_found"
            })
        } else {
            var out = ({
                status: "found",
                number: result[0].number,
                times: result[0].times,
                permit: result[0].permit
            })
            return out
        }
    } catch (err) {
        return "read_error"
    } finally {
        mongoread.close();
    }
}

async function permitacton(id) {
    try {
        var updatewrite = await MongoClient.connect(config.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })

        await updatewrite.db("pmpermit").collection("data").updateOne({ number: id }, { $set: { times: 1, permit: true } })
        fs.readFile(__dirname + `/tempdata/${id}.json`, { encoding: 'utf8' },
            async function(err, data) {
                if (err) {
                    fs.writeFile(__dirname + `/tempdata/${id}.json`, JSON.stringify({
                        status: "found",
                        number: id,
                        times: 1,
                        permit: true

                    }), (ert) => {
                        if (ert) {
                            console.log(ert)
                        } else {}
                    })
                } else {
                    fs.unlink(__dirname + `/tempdata/${id}.json`, async function(erryt) {
                        if (erryt) {} else {
                            fs.writeFile(__dirname + `/tempdata/${id}.json`, JSON.stringify({
                                status: "found",
                                number: id,
                                times: 1,
                                permit: true

                            }), (ert) => {
                                if (ert) {
                                    console.log(ert)
                                } else {}
                            })
                        }
                    })
                }
            })
    } catch (err) {
        return "error"
    } finally {
        updatewrite.close();
    }
}
async function nopermitacton(id) {
    try {
        var updatewrite = await MongoClient.connect(config.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })

        await updatewrite.db("pmpermit").collection("data").updateOne({ number: id }, { $set: { times: 1, permit: false } })
        fs.readFile(__dirname + `/tempdata/${id}.json`, { encoding: 'utf8' },
            async function(err, data) {
                if (err) {} else {
                    fs.unlink(__dirname + `/tempdata/${id}.json`, async function(erryt) {
                        if (erryt) {} else {}
                    })
                }
            })
    } catch (err) {
        return "error"
    } finally {
        updatewrite.close();
    }
}
async function handler(id) {

    async function checkfile(id) {
        try {
            return JSON.parse(await fs.readFileSync(__dirname + `/tempdata/${id}.json`, { encoding: 'utf8' }))
        } catch (error) {
            return await readdb(id)
        }
    }

    var read = await checkfile(id)


    if (read.status == "not_found") { // Insert 
        var insertdb = await insert(id)
        if (insertdb == "insert_error") {
            return "error"
        } else {
            var out = ({
                mute: false,
                msg: `*Hey! This is me Ultron.* \n The Whatsapp Assistant of my master Roldex. \n My master is currently unavailable. \n You can drop your message here. \n And wait until you get reply \n\n Don't Send Much Message Here otherwise I will Mute you For ${config.pmpermit_mutetime/60} Minutes.`
            })
            return out
        }
    } else if (read.status == "found" && read.permit == false) { // if got a object
        if (read.times == 4) {
            var out = ({
                mute: true,
                msg: `*Oh! You Have Been Muted For ${config.pmpermit_mutetime/60} Minutes For Spamming*  \n\n Kindly Wait Until My master Unmute You.✋ Muted*\n\nYou have been muted for ${config.pmpermit_mutetime/60} Minutes for spamming.`
            })
            return out
        } else { // Update times
            var update = await updateviolant(id, Number(read.times) + Number(1))
            if (update == "update_error") {
                return "error"
            } else {
                var out = ({
                    mute: false,
                    msg: `*HEY!*\n\n Kindly Please Wait Until I Will Get Back To Online, Kindly Don't Send Another Message. You Have ${read.times} Warning(s).`
                })
                return out
            }
        }
    } else if (read.status == "found" && read.permit == true) {
        fs.readFile(__dirname + `/tempdata/${id}.json`, { encoding: 'utf8' },
            async function(err, data) {
                if (err) {
                    fs.writeFile(__dirname + `/tempdata/${id}.json`, JSON.stringify({
                        status: "found",
                        number: id,
                        times: 1,
                        permit: true

                    }), (ert) => {})
                } else {}
            })
        return "permitted"
    }
}

module.exports = {
    handler,
    permitacton,
    nopermitacton
}