export interface Pipeline<TContext> {
  execute(context: TContext): Promise<void>;
  reverse?(context: TContext): Promise<void>;
}

export interface Workflow<TContext> {
  addPipeline(pipeline: Pipeline<TContext>): void;
  execute(): Promise<void>;
}

export class SharedContext {
  [key: string]: any; // Extendable object to hold pipeline-specific data
}

export class WorkflowManager<TContext extends SharedContext> implements Workflow<TContext> {
  private pipelines: Pipeline<TContext>[] = [];

  addPipeline(pipeline: Pipeline<TContext>): void {
    this.pipelines.push(pipeline);
  }

  async execute(): Promise<void> {
    const reverseQueue: Pipeline<TContext>[] = [];
    const context: TContext = new SharedContext() as TContext;

    try {
      for (const pipeline of this.pipelines) {
        await pipeline.execute(context);
        reverseQueue.push(pipeline);
      }
    } catch (error) {
      console.error('Error in pipeline execution:', error);

      // Rollback using reverse transactions
      while (reverseQueue.length) {
        const pipeline = reverseQueue.pop();
        if (pipeline?.reverse) {
          try {
            await pipeline.reverse(context);
          } catch (reverseError) {
            console.error('Error in reverse transaction:', reverseError);
          }
        }
      }

      throw error; // Re-throw the error after rollback
    }
  }
}


/*
// Define specific pipelines
class StepOne implements Pipeline<SharedContext> {
  async execute(context: SharedContext): Promise<void> {
    console.log('Executing StepOne');
    context.stepOneData = 'Data from StepOne';
  }

  async reverse(context: SharedContext): Promise<void> {
    console.log('Reversing StepOne');
    delete context.stepOneData;
  }
}

class StepTwo implements Pipeline<SharedContext> {
  async execute(context: SharedContext): Promise<void> {
    console.log('Executing StepTwo with', context.stepOneData);
    context.stepTwoData = 'Data from StepTwo';
    throw new Error('StepTwo failed'); // Simulate an error
  }

  async reverse(context: SharedContext): Promise<void> {
    console.log('Reversing StepTwo');
    delete context.stepTwoData;
  }
}

// Build and execute workflow
const workflow = new WorkflowManager<SharedContext>();
workflow.addPipeline(new StepOne());
workflow.addPipeline(new StepTwo());

workflow.execute().catch((error) => console.error('Workflow failed:', error));
*/
