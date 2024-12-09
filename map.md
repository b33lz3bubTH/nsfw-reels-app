1. multi pre-seeded account 
2. TODO: user registration/login -> uploader(later)
3. user registration/login for viewers
4. single video upload under a uploader, (video, tags, tittle, description, emojis). 
5. viewers views reels based on time of upload, tags.
6. viewers can view based on uploader.



# techstack
===================
1. node ts
2. service pattern
3. sqlite and prisma
4. express
5. task based pipelines in controller.
6. frontend to be decided.


# endpoints
=====================
1. upload "/upload" {id, rawvideo, tags, title, description}
2. search "/search" {tags, time, uploader}
3. endpoint to pull rawvideo {based_on_id}

things has to be superfast
