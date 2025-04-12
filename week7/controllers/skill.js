const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const { isValidString } = require('../utils/validUtils')

const skillController = {
    //取得教練專長列表
    async getSkills (req, res, next) {
        const data = await dataSource.getRepository('Skill').find({
            select: ['id', 'name']
        })
        res.status(200).json({
            status: "success",
            data: data       
        })
        return  
    },
    //新增教練專長
    async postSkills (req, res, next) {
        const { name } = req.body;
        
        if(!isValidString(name)){
            next(appError(400, "欄位未填寫正確"))
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.find({
            where: {
            name: name
            }
        })
        
        if(findSkill.length > 0){
            res.status(409).json({
                status: "failed",
                message: "資料重複"       
            })
            return
        }

        const newSkill = skillRepo.create({
            name
        })
        const result = await skillRepo.save(newSkill)

        res.status(200).json({
            status: "success",
            data: result       
        })
        return
    },
    //刪除教練專長
    async deleteSkills (req, res, next) {
        const { skillId } = req.params 
        if(!isValidString(skillId)){
            next(appError(400, "ID 錯誤")) 
            return
        }

        const result = await dataSource.getRepository('Skill').delete(skillId)

        if(result.affected===0){
            next(appError(400, "ID 錯誤"))  
            return
        }

        res.status(200).json({
            status: "success"     
        })  
        return
    },
}

module.exports = skillController;
