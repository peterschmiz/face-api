import * as tf from '@tensorflow/tfjs/dist/tf.es2017.js';
import { ParamMapping } from './common';
export declare abstract class NeuralNetwork<TNetParams> {
    protected _name: string;
    protected _params: TNetParams | undefined;
    protected _paramMappings: ParamMapping[];
    constructor(_name: string);
    get params(): TNetParams | undefined;
    get paramMappings(): ParamMapping[];
    get isLoaded(): boolean;
    getParamFromPath(paramPath: string): tf.Tensor;
    reassignParamFromPath(paramPath: string, tensor: tf.Tensor): void;
    getParamList(): {
        path: string;
        tensor: any;
    }[];
    getTrainableParams(): {
        path: string;
        tensor: any;
    }[];
    getFrozenParams(): {
        path: string;
        tensor: any;
    }[];
    variable(): void;
    freeze(): void;
    dispose(throwOnRedispose?: boolean): void;
    serializeParams(): Float32Array;
    load(weightsOrUrl: Float32Array | string | undefined): Promise<void>;
    loadFromUri(uri: string | undefined): Promise<void>;
    loadFromDisk(filePath: string | undefined): Promise<void>;
    loadFromWeightMap(weightMap: tf.NamedTensorMap): void;
    extractWeights(weights: Float32Array): void;
    private traversePropertyPath;
    protected abstract getDefaultModelName(): string;
    protected abstract extractParamsFromWeigthMap(weightMap: tf.NamedTensorMap): {
        params: TNetParams;
        paramMappings: ParamMapping[];
    };
    protected abstract extractParams(weights: Float32Array): {
        params: TNetParams;
        paramMappings: ParamMapping[];
    };
}
