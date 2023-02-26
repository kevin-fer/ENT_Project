import express from "express"
import { PrismaClient } from "@prisma/client"
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"

const app = express()
const prisma = new PrismaClient()
app.use(express.json())

let schema = buildSchema(`
    type Societe {
        Soc_id : ID
        Soc_nom : String
        Enseignant : [Enseignant]
    }

    type Enseignant {
        Ens_id : ID
        Ens_prenom : String
        Ens_nom : String
        Ens_date_naissance : String
        Ens_societe_id : ID
        Ens_statut : String
        Societe : Societe
        Prestation : [Prestation]
    }

    type Parcours {
        Par_id : ID
        Par_intitule : String
        Par_responsable_id : ID
        Par_annee_lmd : Int
        Enseignant : Enseignant
    }

    type Classe {
        Cla_id : ID
        Cla_intitule : String
        Cla_annee_promo : Int
        Cla_parcours_id : ID
        Parcours : Parcours
        Etudiant : [Etudiant]
    }

    type Etudiant {
        Etu_id : ID
        Etu_prenom : String
        Etu_nom : String
        Etu_date_naissance : String
        Etu_id_classe : ID
        Classe : Classe
    }

    type Matiere {
        Mat_id : ID
        Mat_intitule : String
    }

    type Programme {
        Pro_parcours_id : ID
        Pro_matiere_id : ID
        Parcours : Parcours
        Matiere : Matiere
    }

    type Cours {
        Cou_id : ID
        Cou_intitule : String
        Cou_datetime_debut : String
        Cou_datetime_fin : String
        Cou_matiere_id : ID
        Cou_classe_id : ID
        Cou_enseignant_id : ID
        Classe : Classe
        Enseignant : Enseignant
        Matiere : Matiere
    }

    type Prestation {
        Pre_matiere_id : ID
        Pre_enseignant_id : ID
        Pre_prix_heure : Float
        Enseignant : Enseignant
        Matiere : Matiere
    }

    type Note {
        Not_id : ID
        Not_value : Float
        Not_coefficient : Float
        Not_etu_id : ID
        Not_matiere_id : ID
        Etudiant : Etudiant
        Matiere : Matiere
    }

    type NoteMoyenne {
        Moyenne : Float
    }

    type PrixPrestation {
        Prix : Float
        Intitule_cours : String
    }

    type Query {
        getSocietes : [Societe]
        getSocieteById(soc_id : ID!) : Societe
        getEnseignants : [Enseignant]
        getEnseignantById(ens_id : ID!) : Enseignant
        getParcours : [Parcours]
        getParcoursById(par_id : ID!) : Parcours
        getClasses : [Classe]
        getClasseById(cla_id : ID!) : Classe
        getEtudiants : [Etudiant]
        getEtudiantById(etu_id : ID!) : Etudiant
        getMatieres : [Matiere]
        getMatiereById(mat_id : ID!) : Matiere
        getProgrammes : [Programme]
        getCours : [Cours]
        getCoursById(cou_id : ID!) : Cours
        getPrestations : [Prestation]
        getNotes : [Note]
        getNotesByEtudiant(etu_id : ID!) : [Note]
        getMoyenneByEtudiant(etu_id : ID!) : NoteMoyenne
        getMoyenneByEtudiantAndByMatiere(etu_id : ID!, mat_id : ID!) : NoteMoyenne
        getPrixCoursSiIntervenantExterne(cou_id : ID!) : PrixPrestation
    }

    type Mutation {
        addSociete(soc_nom : String!) : [Societe]
        upSociete(soc_id : ID!, soc_nom : String!) : Societe
        delSociete(soc_id : ID!) : [Societe]
        addEnseignant(ens_prenom : String!, ens_nom : String!,  ens_dn : String!, soc_id : ID, soc_nom : String) : [Enseignant]
        upEnseignant(ens_id : ID!, ens_prenom : String, ens_nom : String, ens_dn : String, soc_id : ID) : Enseignant
        delEnseignant(ens_id : ID!) : [Enseignant]
        addParcours(par_intitule : String!, par_responsable_id : ID, par_annee_lmd : Int!) : [Parcours]
        upParcours(par_id : ID!, par_intitule : String, par_responsable_id : ID, par_annee_lmd : Int) : Parcours
        delParcours(par_id : ID!) :  [Parcours]
        addClasse(cla_intitule : String!, cla_annee_promo : Int!, cla_parcours_id : ID) : [Classe]
        upClasse(cla_id : ID!, cla_intitule : String, cla_annee_promo : Int, cla_parcours_id : ID) : Classe
        delClasse(cla_id : ID!) : [Classe]
        addEtudiant(etu_prenom : String, etu_nom : String, etu_date_naissance : String, etu_id_classe : ID) : [Etudiant]
        upEtudiant(etu_id : ID!, etu_prenom : String, etu_nom : String, etu_date_naissance : String, etu_id_classe : ID) : Etudiant
        delEtudiant(etu_id : ID!) : [Etudiant]
        addMatiere(mat_intitule: String!) : [Matiere]
        upMatiere(mat_id : ID!, mat_intitule : String!) : Matiere
        delMatiere(mat_id : ID!) : [Matiere]
        addProgramme(pro_parcours_id : ID!, pro_matiere_id : ID!) : [Programme]
        delProgramme(pro_parcours_id : ID!, pro_matiere_id : ID!) : [Programme]
        addCours(cou_intitule : String!, cou_datetime_debut: String!, cou_datetime_fin: String!, cou_matiere_id : ID!, cou_classe_id : ID!, cou_enseignant_id : ID!) : [Cours]
        upCours(cou_id : ID!, cou_intitule : String, cou_datetime_debut: String, cou_datetime_fin: String, cou_matiere_id : ID, cou_classe_id : ID, cou_enseignant_id : ID) : Cours,
        delCours(cou_id : ID!) : [Cours]
        addPrestation(pre_matiere_id : ID!, pre_enseignant_id : ID!, pre_prix_heure : Float) : [Prestation]
        upPrestation(pre_matiere_id : ID!, pre_enseignant_id : ID!, pre_prix_heure : Float) : [Prestation]
        delPrestation(pre_matiere_id : ID!, pre_enseignant_id : ID!) : [Prestation]
        addNote(not_value : Float!, not_coefficient : Float!, not_etu_id : ID!, not_matiere_id : ID!) : [Note]
        upNote(not_id : ID!, not_value : Float!, not_coefficient : Float!, not_etu_id : ID!, not_matiere_id : ID!) : [Note]
        delNote(not_id: ID!) : [Note]
    }

`)

let root = {
    // CRUD Société
    // ---------------------------------------------
    getSocieteById: async({soc_id}) => {
        return await prisma.societe.findUnique({
            where:{Soc_id: Number(soc_id)}
        })
    },
    getSocietes : async () => {
        return await prisma.societe.findMany()
    },
    addSociete : async ({soc_nom}) => {
        return await prisma.societe.create({
            data:{
                Soc_nom: soc_nom
            }
        }).then(async() => {
            return await prisma.societe.findMany()
        })
    },
    upSociete : async({soc_id, soc_nom}) => {
        return await prisma.societe.update({
            where:{Soc_id: Number(soc_id)},
            data: {Soc_nom: soc_nom}
        }).then(async()=>{ return await prisma.societe.findUnique({
            where:{Soc_id: Number(soc_id)}
        }) })
    },
    delSociete : async({soc_id}) => {
        return await prisma.societe.delete({
            where:{Soc_id: Number(soc_id)}
        }).then(async()=>{
            return prisma.societe.findMany()
        })
    },
    // ---------------------------------------------

    // CRUD Enseignant
    // ---------------------------------------------
    getEnseignantById : async({ens_id}) => { 
        
        let d = await prisma.enseignant.findUnique({
            where: {Ens_id: Number(ens_id)},
            include:{
                Societe: {}
            }
        })

        d.Ens_date_naissance = d.Ens_date_naissance.toDateString()

        return d
    },
    getEnseignants : async() => {
        let d = await prisma.enseignant.findMany({
            include:{
                Societe: {}
            }
        })

        d.Ens_date_naissance = d.Ens_date_naissance.toDateString()

        return d

    },
    addEnseignant: async({ens_prenom, ens_nom,  ens_dn, soc_id = 9999, soc_nom = ""}) => {
        if(soc_id != null || soc_nom != null) {
            await prisma.enseignant.create({
                data: {
                    Ens_prenom: ens_prenom,
                    Ens_nom: ens_nom,
                    Ens_date_naissance: new Date(ens_dn),
                    Societe : {
                        connectOrCreate: {
                            create: {
                                Soc_nom: soc_nom
                            },
                            where: {
                                Soc_id: Number(soc_id)
                            }
                        }  
                    } 
                }
            }) 
        } else {
            await prisma.enseignant.create({
                data: {
                    Ens_prenom: ens_prenom,
                    Ens_nom: ens_nom,
                    Ens_date_naissance: new Date(ens_dn)
                }
            }) 
        }

        let temp_obj = {}
        temp_obj = await prisma.enseignant.findMany({
            include:{
                Societe: {}
            }
        })
        temp_obj.Ens_date_naissance = Date.toString(temp_obj.Ens_date_naissance)
        return temp_obj
    },
    upEnseignant : async({ens_id, ens_prenom, ens_nom, ens_dn, soc_id}) => {
        let d = {}
        ens_prenom != null ? d["Ens_prenom"] = ens_prenom : undefined
        ens_nom != null ? d["Ens_nom"] = ens_nom : undefined
        ens_dn != null ? d["Ens_date_naissance"] = new Date(ens_dn) : undefined

        await prisma.enseignant.update({
            data:d,
            where: {Ens_id: Number(ens_id)}
        })
        if(soc_id != null) {
            await prisma.enseignant.update({
                where: {
                    Ens_id: Number(ens_id)
                },
                data: {
                    Societe: {
                        connect: {
                            Soc_id: Number(soc_id)
                        }
                    }
                }
            })
        }
        return await prisma.enseignant.findUnique({
            where: {Ens_id: Number(ens_id)},
            include:{
                Societe:{}
            }
        })
    },
    delEnseignant : async({ens_id}) => {
        return await prisma.enseignant.delete({
            where: {Ens_id: Number(ens_id)}
        }).then(
            async() => {
                return await prisma.enseignant.findMany({
                    include:{
                        Societe: {}
                    }
                })
            }
        )      
    },
    // CRUD Parcours
    // ---------------------------------------------
    getParcoursById : async({par_id}) => {
        return await prisma.parcours.findUnique({
            where:{
                Par_id: Number(par_id)
            },
            include: {
                Enseignant:{}
            }
        })
    },
    getParcours : async() => {
        return await prisma.parcours.findMany({
            include:{
                Enseignant:{}
            }
        })
    },
    addParcours : async({par_intitule, par_responsable_id, par_annee_lmd}) => {
        return await prisma.parcours.create({
            data: {
                Par_intitule: par_intitule,
                Par_annee_lmd: Number(par_annee_lmd),
                Enseignant: {
                    connect: {
                        Ens_id: Number(par_responsable_id)
                    }
                }
            }
        }).then(async() => {
            return await prisma.parcours.findMany({
                include:{
                    Enseignant:{}
                }
            })
        }) 
    },
    upParcours : async({par_id, par_intitule, par_responsable_id, par_annee_lmd}) => {
        let d = {}
        par_intitule != null ? d["Par_intitule"] = par_intitule : undefined
        par_annee_lmd != null ? d["Par_annee_lmd"] = Number(par_annee_lmd) : undefined

        return await prisma.parcours.update({
            data:d,
            where:{Par_id: Number(par_id)}
        }).then(async() => {
            if(par_responsable_id != null) {
                await prisma.parcours.update({
                    data: {
                        Enseignant: {
                            connect:{
                                Ens_id: Number(par_responsable_id)
                            }
                        }
                    },
                    where:{Par_id: Number(par_id)}                      
                })
            }
            return await prisma.parcours.findUnique({
                where:{Par_id: Number(par_id)},
                include:{
                    Enseignant:{}
                }     
            })
        })       
    },
    delParcours : async({par_id}) => {
        return await prisma.parcours.delete({
            where: {
                Par_id: Number(par_id)
            }
        }).then(async()=>{
            return await prisma.parcours.findMany({
                include:{
                    Enseignant:{}
                }
            })
        })
    },
    // CRUD Classe
    // ---------------------------------------------
    getClasseById: async({cla_id}) => {
        return await prisma.classe.findUnique({
            where: {Cla_id: Number(cla_id)},
            include: {
                Parcours: {}
            }
        })
    }, 
    getClasses : async() => {
        return await prisma.classe.findMany({
            include: {
                Parcours: {}
            }
        })
    },
    addClasse : async({cla_intitule, cla_annee_promo, cla_parcours_id}) => {
        return await prisma.classe.create({
            data:{
                Cla_intitule: cla_intitule,
                Cla_annee_promo:Number(cla_annee_promo),
                Parcours:{
                    connect:{
                        Par_id: Number(cla_parcours_id)
                    }
                }
            }
        }).then(async() => {
            return await prisma.classe.findMany({
                include:{
                    Parcours: {}
                }
            })
        })
    },

    upClasse : async({cla_id, cla_intitule, cla_annee_promo, cla_parcours_id}) => {
        let d = {}
        cla_intitule != null ? d["Cla_intitule"] = cla_intitule : undefined
        cla_annee_promo != null ? d["Cla_annee_promo"] = Number(cla_annee_promo) : undefined
        
        await prisma.classe.update({
            where:{Cla_id: Number(cla_id)},
            data:d
        })

        if(cla_parcours_id != null) {
            await prisma.classe.update({
                where:{Cla_id: Number(cla_id)},
                data:{
                    Parcours:{
                        connect:{
                            Par_id: Number(cla_parcours_id)
                        }
                    }
                }
            })
        }

        return await prisma.classe.findUnique({
            where:{Cla_id: Number(cla_id)},
            include: {
                Parcours:{}
            }
        })
    },
    delClasse : async({cla_id}) => {
        return await prisma.classe.delete({
            where:{Cla_id: Number(cla_id)}
        }).then(
            async () => {
                return await prisma.classe.findMany({
                    include:{
                        Parcours: {}
                    }
                })
            }
        )
    },
    // CRUD Etudiant
    // ---------------------------------------------
    getEtudiantById: async({etu_id}) => {
        return await prisma.etudiant.findUnique({
            where:{Etu_id: Number(etu_id)}
        })
    },
    getEtudiants : async() => {
        return prisma.etudiant.findMany({
            include: {
                Classe: {}
            }
        })
    },
    addEtudiant : async({etu_prenom, etu_nom, etu_date_naissance, etu_id_classe}) => {
        if(etu_id_classe === null) {
            await prisma.etudiant.create({
                data:{
                    Etu_prenom: etu_prenom,
                    Etu_nom: etu_nom,
                    Etu_date_naissance: new Date(etu_date_naissance)
                }
            })
        } else {
            await prisma.etudiant.create({
                data:{
                    Etu_prenom: etu_prenom,
                    Etu_nom: etu_nom,
                    Etu_date_naissance: new Date(etu_date_naissance),
                    Classe: {
                        connect:{
                            Cla_id: Number(etu_id_classe)
                        }
                    }
                }
            })
        }

        return await prisma.etudiant.findMany({
            include: {
                Classe: {}
            }
        })
    },
    upEtudiant : async({etu_id, etu_prenom, etu_nom, etu_date_naissance, etu_id_classe}) => {
        let d = {}
        etu_prenom != null ? d["Etu_prenom"] = etu_prenom : undefined
        etu_nom != null ? d["Etu_nom"] = etu_nom : undefined
        etu_date_naissance != null ? d["Etu_date_naissance"] = new Date(etu_date_naissance) : undefined
        etu_id_classe != null ? d["Etu_id_classe"] = Number(etu_id_classe) : undefined

        await prisma.etudiant.update({
            where:{ Etu_id: Number(etu_id)},
            data: d
        })

        return await prisma.etudiant.findUnique({
            include:{
                Classe: {}
            },
            where: {Etu_id: Number(etu_id)}
        })
    },
    delEtudiant: async({etu_id}) => {
        return await prisma.etudiant.delete({
            where: {Etu_id: Number(etu_id)}
        }).then(async() => {
            return await prisma.etudiant.findMany({
                include: {
                    Classe: {}
                }
            })
        })
    },
    // CRUD Matière
    // ---------------------------------------------
    getMatiereById : async({mat_id}) => {
        return await prisma.matiere.findUnique({
            where: {Mat_id: Number(mat_id)}
        })
    },
    getMatieres : async() => {
        return await prisma.matiere.findMany()
    },
    addMatiere : async({mat_intitule}) => {
        return await prisma.matiere.create({
            data: {
                Mat_intitule: mat_intitule
            }
        }).then(async() => {
            return await prisma.matiere.findMany()
        })
    },
    upMatiere : async({mat_id, mat_intitule}) => {
        return await prisma.matiere.update({
            where: {Mat_id: Number(mat_id)},
            data: {
                Mat_intitule: mat_intitule
            }
        })
    },
    delMatiere : async({mat_id}) => {
        return await prisma.matiere.delete({
            where: {Mat_id: Number(mat_id)}
        }).then(async() => {
            return await prisma.matiere.findMany()
        })    
    },
    // CRUD Programme (association entre Parcours & Matière)
    // ---------------------------------------------
    getProgrammes : async() => {
        return await prisma.programme.findMany({
            include:{
                Parcours: {},
                Matiere : {}
            }
        })
    },
    addProgramme : async({pro_parcours_id, pro_matiere_id}) => {
        return await prisma.programme.create({
            data: {
                Pro_parcours_id: Number(pro_parcours_id),
                Pro_matiere_id: Number(pro_matiere_id)
            }
        }).then(async() => {
            return await prisma.programme.findMany({
                include: {
                    Parcours:{},
                    Matiere: {}
                }
            })
        })
    },
    delProgramme : async({pro_parcours_id, pro_matiere_id}) => {
        pro_parcours_id = Number(pro_parcours_id)
        pro_matiere_id = Number(pro_matiere_id)
        return await prisma.programme.delete({
            where: {
                Pro_parcours_id_Pro_matiere_id : {
                    Pro_parcours_id: pro_parcours_id,
                    Pro_matiere_id: pro_matiere_id
                }
            }
        }).then(async() => {
            return await prisma.programme.findMany()
        })
    },
    // CRUD Cours
    // ---------------------------------------------
    getCoursById : async({cou_id}) => {
        return await prisma.cours.findUnique({
            where: {Cou_id: Number(cou_id)},
            include: {
                Matiere: {},
                Classe: {},
                Enseignant: {}
            } 
        })
    },
    getCours : async() => {
        return await prisma.cours.findMany({
            include: {
                Matiere: {},
                Classe: {},
                Enseignant: {}
            } 
        })
    },
    addCours : async({cou_intitule, cou_datetime_debut, cou_datetime_fin, cou_matiere_id, cou_classe_id, cou_enseignant_id}) => {
        return await prisma.cours.create({
            data: {
                Cou_intitule: cou_intitule,
                Cou_datetime_debut: new Date(cou_datetime_debut),
                Cou_datetime_fin: new Date(cou_datetime_fin),
                Cou_matiere_id: Number(cou_matiere_id),
                Cou_classe_id: Number(cou_classe_id),
                Cou_enseignant_id: Number(cou_enseignant_id)
            }
        }).then(async() => {
            return await prisma.cours.findMany({
                include: {
                    Matiere: {},
                    Classe: {},
                    Enseignant: {}
                }
            })
        })
    },
    upCours : async({cou_id, cou_intitule, cou_datetime_debut, cou_datetime_fin, cou_matiere_id, cou_classe_id, cou_enseignant_id}) => {
        let d = {}
        cou_intitule != null ? d["Cou_intitule"] = cou_intitule : undefined
        cou_datetime_debut != null ? d["Cou_datetime_debut"] = new Date(cou_datetime_debut) : undefined
        cou_datetime_fin != null ? d["Cou_datetime_fin"] = new Date(cou_datetime_fin) : undefined
        cou_matiere_id != null ? d["Cou_matiere_id"] = Number(cou_matiere_id) : undefined
        cou_classe_id != null ? d["Cou_classe_id"] = Number(cou_classe_id) : undefined
        cou_enseignant_id != null ? d["Cou_enseignant_id"] = Number(cou_enseignant_id) : undefined

        return await prisma.cours.update({
            data: d,
            where: {Cou_id: Number(cou_id)}
        }).then(async() => {
            return await prisma.cours.findUnique({
                include: {
                    Matiere: {},
                    Classe: {},
                    Enseignant: {}
                },
                where: {Cou_id: Number(cou_id)}
            })
        })
    },
    delCours : async({cou_id}) => {
        return await prisma.cours.delete({
            where: {Cou_id: Number(cou_id)}
        }).then(async() => {
            return await prisma.cours.findMany({
                include: {
                    Matiere: {},
                    Classe: {},
                    Enseignant: {}
                }   
            })
        })
    },
    // CRUD Prestation
    // ---------------------------------------------
    getPrixCoursSiIntervenantExterne : async({cou_id}) => {
        let r = {}

        const d = await prisma.cours.findUnique({
            where: {Cou_id: Number(cou_id)},
            include: {
                Enseignant: {
                    include : {Prestation: {}}
                }
            }
        })

        if(d.Enseignant.Ens_statut === "externe") {
            const p = await prisma.prestation.findUnique({
                where: {
                    Pre_matiere_id_Pre_enseignant_id: {
                        Pre_enseignant_id: d.Cou_enseignant_id,
                        Pre_matiere_id: d.Cou_matiere_id
                    }
                }
            })

            const getDuration = async() => { 
                const result = await prisma.$queryRaw`SELECT TIMEDIFF(${d.Cou_datetime_fin}, ${d.Cou_datetime_debut}) AS "result";`
                //return ((new Date(result[0].result).getUTCHours() * 3600) + (new Date(result[0].result).getUTCMinutes() * 60) + new Date(result[0].result).getUTCSeconds())
                return result[0].result
            } 
            console.log(new Date(await getDuration()).getUTCMinutes() === 0)

            r["Prix"] = Number((Number(p.Pre_prix_heure) * new Date(await getDuration()).getUTCHours()) + Number((new Date(await getDuration()).getUTCMinutes() === 0)? 0 : (Number(p.pre_prix_heure) * (new Date(await getDuration()).getUTCMinutes() / 60))))

            r["Intitule_cours"] = d["Cou_intitule"]
            
            return r
            
        } else 
            return "Cours encadré par un enseignant non-externe"

    },
    getPrestations : async() => {
        return await prisma.prestation.findMany({
            include: {
                Enseignant: {},
                Matiere: {}
            }
        })
    },
    addPrestation : async({pre_matiere_id, pre_enseignant_id, pre_prix_heure}) => {
        let d = {}
        d["Pre_matiere_id"] = Number(pre_matiere_id)
        d["Pre_enseignant_id"] = Number(pre_enseignant_id)
        pre_prix_heure != null ? d["Pre_prix_heure"] = Number(pre_prix_heure) : undefined

        return await prisma.prestation.create({
            data:d
        }).then(async() => {
            return await prisma.prestation.findMany({
                include: {
                    Enseignant: {},
                    Matiere: {}
                }
            })
        })
    },
    upPrestation : async({pre_matiere_id, pre_enseignant_id, pre_prix_heure}) => {
        let d = {}
        d["Pre_matiere_id"] = Number(pre_matiere_id)
        d["Pre_enseignant_id"] = Number(pre_enseignant_id)
        pre_prix_heure != null ? d["Pre_prix_heure"] = Number(pre_prix_heure) : undefined

        return await prisma.prestation.update({
            data:d,
            where: {
                Pre_matiere_id_Pre_enseignant_id: {
                    Pre_enseignant_id: d["Pre_enseignant_id"],
                    Pre_matiere_id: d["Pre_matiere_id"]
                }
            }
        }).then(async() => {
            return await prisma.prestation.findMany({
                include: {
                    Enseignant: {},
                    Matiere: {}
                }
            })
        })
    },
    delPrestation : async({pre_matiere_id, pre_enseignant_id}) => {
        let d = {}
        d["Pre_matiere_id"] = Number(pre_matiere_id)
        d["Pre_enseignant_id"] = Number(pre_enseignant_id)

        return await prisma.prestation.delete({
            where: {
                Pre_matiere_id_Pre_enseignant_id: {
                    Pre_enseignant_id: d["Pre_enseignant_id"],
                    Pre_matiere_id: d["Pre_matiere_id"]
                }
            }
        }).then(async() => {
            return await prisma.prestation.findMany({
                include: {
                    Enseignant: {},
                    Matiere: {}
                }
            })
        })
    },
    // CRUD Note
    // ---------------------------------------------
    getMoyenneByEtudiantAndByMatiere: async({etu_id, mat_id}) => {
        let r = {}
        const d = await prisma.note.findMany({
            include: {
                Etudiant: {},
                Matiere: {}
            },
            where: {
                Not_etu_id: Number(etu_id),
                Not_matiere_id: Number(mat_id)
            } 
        })
        let sommeM = 0.0
        let sommeC = 0.0
        d.forEach(element => {
            sommeM = sommeM + (element["Not_value"] * element["Not_coefficient"])
            sommeC = sommeC + element["Not_coefficient"]
        });

        r["Moyenne"] = Number(sommeM / sommeC)
        return r
    },
    getMoyenneByEtudiant : async({etu_id}) => {
        let r = {}
        const d = await prisma.note.findMany({
            include: {
                Etudiant: {},
                Matiere: {}
            },
            where: {
                Not_etu_id: Number(etu_id)
            } 
        })
        let sommeM = 0.0
        let sommeC = 0.0
        d.forEach(element => {
            sommeM = sommeM + (element["Not_value"] * element["Not_coefficient"])
            sommeC = sommeC + element["Not_coefficient"]
        });

        r["Moyenne"] = Number(sommeM / sommeC)
        return r

    },
    getNotesByEtudiant : async({etu_id}) => {
        return await prisma.note.findMany({
            include: {
                Etudiant: {},
                Matiere: {}
            },
            where: {
                Not_etu_id: Number(etu_id)
            }
        })
    },
    getNotes : async() => {
        return await prisma.note.findMany({
            include: {
                Etudiant: {},
                Matiere: {}
            }
        })
    },
    addNote : async({not_value, not_coefficient, not_etu_id, not_matiere_id}) => {
        return await prisma.note.create({
            data: {
                Not_value: Number(not_value),
                Not_coefficient: Number(not_coefficient),
                Not_etu_id: Number(not_etu_id),
                Not_matiere_id: Number(not_matiere_id)
            }
        }).then(async () => {
            return await prisma.note.findMany({
                include: {
                    Etudiant: {},
                    Matiere: {}
                }
            })
        })
    },
    upNote : async({not_id, not_value, not_coefficient, not_etu_id, not_matiere_id}) => {
        let d = {}
        not_value != null ? d["Not_value"] = Number(not_value) : undefined
        not_coefficient != null ? d["Not_coefficient"] = Number(not_coefficient) : undefined
        not_etu_id != null ? d["Not_etu_id"] = Number(not_etu_id) : undefined
        not_matiere_id != null ? d["Not_matiere_id"] = Number(not_matiere_id) : undefined

        return await prisma.note.update({
            where: {
                Not_id: Number(not_id)
            },
            data:d
        }).then(async () => {
            return await prisma.note.findMany({
                include: {
                    Etudiant: {},
                    Matiere: {}
                }
            })
        })
    },
    delNote : async({not_id}) => {

        return await prisma.note.delete({
            where: {
                Not_id: Number(not_id)
            }
        }).then(async () => {
            return await prisma.note.findMany({
                include: {
                    Etudiant: {},
                    Matiere: {}
                }
            })
        })
    }
}

app.use("/graphql", graphqlHTTP({
    schema : schema,
    rootValue : root,
    graphiql : true
}))

app.listen(3000, () => {
    console.log("serveur démarré")
})