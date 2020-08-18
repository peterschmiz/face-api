import { FaceDetection } from '../classes/FaceDetection';
import { TNetInput } from '../dom';
import { extendWithFaceDetection, WithFaceDetection } from '../factories/WithFaceDetection';
import { TinyFaceDetectorOptions } from '../tinyFaceDetector/TinyFaceDetectorOptions';
import { ComposableTask } from './ComposableTask';
import { DetectAllFaceLandmarksTask, DetectSingleFaceLandmarksTask } from './DetectFaceLandmarksTasks';
import { nets } from './nets';
import { PredictAllAgeAndGenderTask, PredictSingleAgeAndGenderTask } from './PredictAgeAndGenderTask';
import { PredictAllFaceExpressionsTask, PredictSingleFaceExpressionsTask } from './PredictFaceExpressionsTask';
import { FaceDetectionOptions } from './types';

export class DetectFacesTaskBase<TReturn> extends ComposableTask<TReturn> {
  constructor(
    protected input: TNetInput,
    protected options: FaceDetectionOptions = new TinyFaceDetectorOptions()
  ) {
    super()
  }
}

export class DetectAllFacesTask extends DetectFacesTaskBase<FaceDetection[]> {

  public async run(): Promise<FaceDetection[]> {

    const { input, options } = this


    const faceDetectionFunction = options instanceof TinyFaceDetectorOptions
      ? (input: TNetInput) => nets.tinyFaceDetector.locateFaces(input, options)
      : null

    if (!faceDetectionFunction) {
      throw new Error('detectFaces - expected options to be instance of TinyFaceDetectorOptions | SsdMobilenetv1Options | MtcnnOptions | TinyYolov2Options')
    }

    return faceDetectionFunction(input)
  }

  private runAndExtendWithFaceDetections(): Promise<WithFaceDetection<{}>[]> {
    return new Promise<WithFaceDetection<{}>[]>(async res => {
      const detections = await this.run()
      return res(detections.map(detection => extendWithFaceDetection({}, detection)))
    })
  }

  withFaceLandmarks(useTinyLandmarkNet: boolean = false) {
    return new DetectAllFaceLandmarksTask(
      this.runAndExtendWithFaceDetections(),
      this.input,
      useTinyLandmarkNet
    )
  }

  withFaceExpressions() {
    return new PredictAllFaceExpressionsTask (
      this.runAndExtendWithFaceDetections(),
      this.input
    )
  }

  withAgeAndGender() {
    return new PredictAllAgeAndGenderTask(
      this.runAndExtendWithFaceDetections(),
      this.input
    )
  }
}

export class DetectSingleFaceTask extends DetectFacesTaskBase<FaceDetection | undefined> {

  public async run(): Promise<FaceDetection | undefined> {
    const faceDetections = await new DetectAllFacesTask(this.input, this.options);
    let faceDetectionWithHighestScore = faceDetections[0];
    faceDetections.forEach(faceDetection => {
      if (faceDetection.score > faceDetectionWithHighestScore.score) {
        faceDetectionWithHighestScore = faceDetection;
      }
    });
    return faceDetectionWithHighestScore;
  }

  private runAndExtendWithFaceDetection(): Promise<WithFaceDetection<{}>> {
    return new Promise<WithFaceDetection<{}>>(async res => {
      const detection = await this.run()
      return res(detection ? extendWithFaceDetection<{}>({}, detection) : undefined)
    })
  }

  withFaceLandmarks(useTinyLandmarkNet: boolean = false) {
    return new DetectSingleFaceLandmarksTask(
      this.runAndExtendWithFaceDetection(),
      this.input,
      useTinyLandmarkNet
    )
  }

  withFaceExpressions() {
    return new PredictSingleFaceExpressionsTask(
      this.runAndExtendWithFaceDetection(),
      this.input
    )
  }

  withAgeAndGender() {
    return new PredictSingleAgeAndGenderTask(
      this.runAndExtendWithFaceDetection(),
      this.input
    )
  }
}