
    // const countIN = await GameAssing.count({
    //   where: {
    //     gaGameId: { [Op.in]: gameGroup },
    //     gaLearnerId: req.body.data.learnerId,
    //   },
    // });
    
    // if (countIN > 0) {
    //   await GameAssing.update(
    //     { gaDeleteStatus: 'NO' },
    //     {
    //       where: {
    //         gaGameId: { [Op.in]: gameGroup },
    //         gaLearnerId: req.body.data.learnerId,
    //       },
    //     }
    //   );
    // }
    
    // const countNotIn = await GameAssing.count({
    //   where: {
    //     gaGameId: { [Op.notIn]: gameGroup },
    //     gaLearnerId: req.body.data.learnerId,
    //   },
    // });
    
    // if (countNotIn > 0) {
    //   await GameAssing.update(
    //     { gaDeleteStatus: 'YES' },
    //     {
    //       where: {
    //         gaGameId: { [Op.notIn]: gameGroup },
    //         gaLearnerId: req.body.data.learnerId,
    //       },
    //     }
    //   );
    // }


    const count = await GameAssing.count({
        where: {
          gaGameId: gameGroup[i],
          gaLearnerId: req.body.data.learnerId,
        },
      });

      if (count === 0) {
        const gameAssign = await GameAssing.create(newData);
        data.push(gameAssign); // Push the created record to the array
      }